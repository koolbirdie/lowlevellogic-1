/**
 * Interpreter for IGCSE/A-LEVELS pseudocode
 * Executes AST and yields output
 */

import {
  ASTNode,
  ExpressionNode,
  DeclareNode,
  AssignmentNode,
  OutputNode,
  InputNode,
  IfNode,
  WhileNode,
  RepeatNode,
  ForNode,
  CaseNode,
  ProcedureNode,
  FunctionNode,
  CallNode,
  ReturnNode,
  OpenFileNode,
  CloseFileNode,
  ReadFileNode,
  WriteFileNode,
  MemoryFreeNode,
  LiteralNode,
  IdentifierNode,
  ArrayAccessNode,
  FunctionCallNode,
  BinaryOpNode,
  UnaryOpNode,
  AddressOfNode,
  DereferenceNode,
  MemoryAllocationNode,
  SizeOfNode,
  ExecutionContext,
  Variable,
  RuntimeError,
  CallStackFrame,
  DebugState
} from './types';

import { MemoryEngine } from './memory';

const MAX_ITERATIONS = 10000;
const MAX_RECURSION_DEPTH = 1000;

interface FileHandle {
  mode: 'READ' | 'WRITE' | 'APPEND';
  data: string[];
  position: number;
}

class ReturnValue {
  constructor(public value: any) {}
}

export class Interpreter {
  private globalContext: ExecutionContext;
  private iterationCount = 0;
  private recursionDepth = 0;
  private inputHandler: (variableName: string, variableType: string) => Promise<string>;
  private debugMode: boolean;
  private callStack: CallStackFrame[];
  private stepCallback?: () => Promise<void>;
  private fileHandles: Map<string, FileHandle> = new Map();
  private fileWriteOutput: boolean;
  private fileUploadHandler?: (filename: string) => Promise<string>;
  private memory: MemoryEngine;
  private variableAddresses: Map<string, number>;

  constructor(
    inputHandler?: (variableName: string, variableType: string) => Promise<string>,
    debugMode: boolean = false,
    stepCallback?: () => Promise<void>,
    fileWriteOutput: boolean = true,
    fileUploadHandler?: (filename: string) => Promise<string>
  ) {
    this.globalContext = {
      variables: new Map(),
      procedures: new Map(),
      functions: new Map()
    };
    this.inputHandler = inputHandler || this.defaultInputHandler;
    this.debugMode = debugMode;
    this.callStack = [{ name: 'main', line: 1, type: 'main' }];
    this.stepCallback = stepCallback;
    this.fileWriteOutput = fileWriteOutput;
    this.fileUploadHandler = fileUploadHandler;
    this.memory = new MemoryEngine();
    this.variableAddresses = new Map();
  }

  private defaultInputHandler(variableName: string): Promise<string> {
    return Promise.resolve(window.prompt(`Enter value for ${variableName}:`) || '');
  }

  public getDebugState(): DebugState {
    return {
      currentLine: this.callStack.length > 0 ? this.callStack[this.callStack.length - 1].line : 1,
      callStack: [...this.callStack],
      variables: new Map(this.globalContext.variables),
      isPaused: this.debugMode,
      isRunning: true
    };
  }

  public disableDebugMode(): void {
    this.debugMode = false;
  }

  // Memory system getters for UI access
  public getMemoryEngine(): MemoryEngine {
    return this.memory;
  }

  public getVariableAddresses(): Map<string, number> {
    return new Map(this.variableAddresses);
  }

  public getFileContent(filename: string): string | null {
    const fileHandle = this.fileHandles.get(filename);
    if (!fileHandle) {
      return null;
    }
    return fileHandle.data.join('\n');
  }

  public getAllFiles(): Array<{ filename: string; mode: string; lineCount: number }> {
    const files: Array<{ filename: string; mode: string; lineCount: number }> = [];
    for (const [filename, handle] of this.fileHandles.entries()) {
      files.push({
        filename,
        mode: handle.mode,
        lineCount: handle.data.length
      });
    }
    return files;
  }

  public async* executeProgram(ast: ASTNode[]): AsyncGenerator<string, void, unknown> {
    yield* this.execute(ast);
  }

  public async* execute(ast: ASTNode[]): AsyncGenerator<string, void, unknown> {
    // First pass: register procedures and functions
    for (const node of ast) {
      if (node.type === 'Procedure') {
        this.globalContext.procedures.set((node as ProcedureNode).name, node as ProcedureNode);
      } else if (node.type === 'Function') {
        this.globalContext.functions.set((node as FunctionNode).name, node as FunctionNode);
      }
    }

    // Second pass: execute statements
    for (const node of ast) {
      if (node.type !== 'Procedure' && node.type !== 'Function') {
        yield* this.executeNode(node, this.globalContext);
      }
    }
  }

  private async* executeNode(node: ASTNode, context: ExecutionContext): AsyncGenerator<string, any, unknown> {
    this.iterationCount++;
    if (this.iterationCount > MAX_ITERATIONS) {
      throw new RuntimeError('Execution timeout: Possible infinite loop', node.line);
    }

    // Debug mode: Pause before executing each statement
    if (this.debugMode && this.stepCallback) {
      // Update call stack with current line
      if (this.callStack.length > 0) {
        this.callStack[this.callStack.length - 1].line = node.line;
      }
      
      // Wait for step command
      await this.stepCallback();
    }

    switch (node.type) {
      case 'Declare':
        this.executeDeclare(node as DeclareNode, context);
        break;
      case 'Assignment':
        yield* this.executeAssignment(node as AssignmentNode, context);
        break;
      case 'Output':
        yield* this.executeOutput(node as OutputNode, context);
        break;
      case 'Input':
        yield* this.executeInput(node as InputNode, context);
        break;
      case 'If':
        yield* this.executeIf(node as IfNode, context);
        break;
      case 'While':
        yield* this.executeWhile(node as WhileNode, context);
        break;
      case 'Repeat':
        yield* this.executeRepeat(node as RepeatNode, context);
        break;
      case 'For':
        yield* this.executeFor(node as ForNode, context);
        break;
      case 'Case':
        yield* this.executeCase(node as CaseNode, context);
        break;
      case 'Call':
        yield* this.executeCall(node as CallNode, context);
        break;
      case 'Return':
        const returnValue = this.evaluateExpression((node as ReturnNode).value, context);
        throw new ReturnValue(returnValue);
      case 'OpenFile':
        yield* this.executeOpenFile(node as OpenFileNode, context);
        break;
      case 'CloseFile':
        yield* this.executeCloseFile(node as CloseFileNode, context);
        break;
      case 'ReadFile':
        yield* this.executeReadFile(node as ReadFileNode, context);
        break;
      case 'WriteFile':
        yield* this.executeWriteFile(node as WriteFileNode, context);
        break;
      case 'MemoryFree':
        yield* this.executeMemoryFree(node as MemoryFreeNode, context);
        break;
      default:
        throw new RuntimeError(`Unknown node type: ${node.type}`, node.line);
    }
  }

  private executeDeclare(node: DeclareNode, context: ExecutionContext): void {
    if (node.dataType === 'ARRAY') {
      const dimensions = node.arrayBounds!.dimensions;
      context.variables.set(node.identifier, {
        type: 'ARRAY',
        value: this.createArray(dimensions),
        dimensions,
        elementType: node.arrayElementType,
        initialized: false
      });
    } else {
      context.variables.set(node.identifier, {
        type: node.dataType,
        value: undefined,
        initialized: false
      });
    }
  }

  private createArray(dimensions: Array<{ lower: number; upper: number }>): any {
    if (dimensions.length === 1) {
      const { lower, upper } = dimensions[0];
      const arr: any = {};
      for (let i = lower; i <= upper; i++) {
        arr[i] = { initialized: false, value: undefined };
      }
      return arr;
    } else {
      const { lower, upper } = dimensions[0];
      const arr: any = {};
      for (let i = lower; i <= upper; i++) {
        arr[i] = this.createArray(dimensions.slice(1));
      }
      return arr;
    }
  }

  private async* executeAssignment(node: AssignmentNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const value = this.evaluateExpression(node.value, context);

    if (node.target.type === 'Identifier') {
      const varName = (node.target as IdentifierNode).name;
      const variable = this.getVariable(varName, context);

      if (!variable) {
        throw new RuntimeError(`Variable '${varName}' not declared`, node.line);
      }

      variable.value = value;
      variable.initialized = true;
    } else if (node.target.type === 'ArrayAccess') {
      const arrayAccess = node.target as ArrayAccessNode;
      const variable = this.getVariable(arrayAccess.array, context);

      if (!variable) {
        throw new RuntimeError(`Array '${arrayAccess.array}' not declared`, node.line);
      }

      if (variable.type !== 'ARRAY') {
        throw new RuntimeError(`'${arrayAccess.array}' is not an array`, node.line);
      }

      const indices = arrayAccess.indices.map(idx => {
        const val = this.evaluateExpression(idx, context);
        if (typeof val !== 'number') {
          throw new RuntimeError(`Array index must be a number`, node.line);
        }
        return Math.floor(val);
      });

      this.setArrayElement(variable.value, indices, value, variable.dimensions!, node.line);
    }
  }

  private setArrayElement(arr: any, indices: number[], value: any, dimensions: Array<{ lower: number; upper: number }>, line: number): void {
    if (indices.length === 1) {
      const idx = indices[0];
      const { lower, upper } = dimensions[0];

      if (idx < lower || idx > upper) {
        throw new RuntimeError(`Array index out of bounds`, line);
      }

      arr[idx] = { initialized: true, value };
    } else {
      const idx = indices[0];
      const { lower, upper } = dimensions[0];

      if (idx < lower || idx > upper) {
        throw new RuntimeError(`Array index out of bounds`, line);
      }

      this.setArrayElement(arr[idx], indices.slice(1), value, dimensions.slice(1), line);
    }
  }

  private async* executeOutput(node: OutputNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const parts: string[] = [];

    for (const expr of node.expressions) {
      const value = this.evaluateExpression(expr, context);
      parts.push(this.valueToString(value));
    }

    yield parts.join(' ');
  }

  private async* executeInput(node: InputNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    if (node.target.type === 'Identifier') {
      // Simple variable input
      const varName = (node.target as IdentifierNode).name;
      const variable = this.getVariable(varName, context);

      if (!variable) {
        throw new RuntimeError(`Variable '${varName}' not declared`, node.line);
      }

      // Use the inputHandler to get input
      const input = await this.inputHandler(varName, variable.type);

      // Type conversion based on variable type
      let value: any;
      switch (variable.type) {
        case 'INTEGER':
          value = parseInt(input) || 0;
          break;
        case 'REAL':
          value = parseFloat(input) || 0.0;
          break;
        case 'BOOLEAN':
          value = input.toLowerCase() === 'true';
          break;
        default:
          value = input;
      }

      variable.value = value;
      variable.initialized = true;
      
      // Echo the entered value to output
      yield input;
    } else if (node.target.type === 'ArrayAccess') {
      // Array element input
      const arrayAccess = node.target as ArrayAccessNode;
      const variable = this.getVariable(arrayAccess.array, context);

      if (!variable) {
        throw new RuntimeError(`Array '${arrayAccess.array}' not declared`, node.line);
      }

      if (variable.type !== 'ARRAY') {
        throw new RuntimeError(`'${arrayAccess.array}' is not an array`, node.line);
      }

      const indices = arrayAccess.indices.map(idx => {
        const val = this.evaluateExpression(idx, context);
        if (typeof val !== 'number') {
          throw new RuntimeError(`Array index must be a number`, node.line);
        }
        return Math.floor(val);
      });

      // Determine the type to prompt for based on array element type
      const elementType = variable.elementType || 'STRING';
      const promptName = `${arrayAccess.array}[${indices.join(', ')}]`;
      
      // Use the inputHandler to get input
      const input = await this.inputHandler(promptName, elementType);

      // Type conversion based on element type
      let value: any;
      switch (elementType) {
        case 'INTEGER':
          value = parseInt(input) || 0;
          break;
        case 'REAL':
          value = parseFloat(input) || 0.0;
          break;
        case 'BOOLEAN':
          value = input.toLowerCase() === 'true';
          break;
        default:
          value = input;
      }

      this.setArrayElement(variable.value, indices, value, variable.dimensions!, node.line);
      
      // Echo the entered value to output
      yield input;
    }
  }

  private async* executeIf(node: IfNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const condition = this.evaluateExpression(node.condition, context);

    if (typeof condition !== 'boolean') {
      throw new RuntimeError(`IF condition must be boolean`, node.line);
    }

    if (condition) {
      for (const stmt of node.thenBlock) {
        yield* this.executeNode(stmt, context);
      }
    } else if (node.elseIfBlocks) {
      let executed = false;
      for (const elseIfBlock of node.elseIfBlocks) {
        const elseIfCondition = this.evaluateExpression(elseIfBlock.condition, context);

        if (typeof elseIfCondition !== 'boolean') {
          throw new RuntimeError(`ELSE IF condition must be boolean`, node.line);
        }

        if (elseIfCondition) {
          for (const stmt of elseIfBlock.block) {
            yield* this.executeNode(stmt, context);
          }
          executed = true;
          break;
        }
      }

      if (!executed && node.elseBlock) {
        for (const stmt of node.elseBlock) {
          yield* this.executeNode(stmt, context);
        }
      }
    } else if (node.elseBlock) {
      for (const stmt of node.elseBlock) {
        yield* this.executeNode(stmt, context);
      }
    }
  }

  private async* executeWhile(node: WhileNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    while (true) {
      const condition = this.evaluateExpression(node.condition, context);

      if (typeof condition !== 'boolean') {
        throw new RuntimeError(`WHILE condition must be boolean`, node.line);
      }

      if (!condition) break;

      for (const stmt of node.body) {
        yield* this.executeNode(stmt, context);
      }
    }
  }

  private async* executeRepeat(node: RepeatNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    do {
      for (const stmt of node.body) {
        yield* this.executeNode(stmt, context);
      }

      const condition = this.evaluateExpression(node.condition, context);

      if (typeof condition !== 'boolean') {
        throw new RuntimeError(`UNTIL condition must be boolean`, node.line);
      }

      if (condition) break;
    } while (true);
  }

  private async* executeFor(node: ForNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    let variable = this.getVariable(node.variable, context);

    // Auto-declare loop variable if it doesn't exist (implicit INTEGER type)
    if (!variable) {
      context.variables.set(node.variable, {
        type: 'INTEGER',
        value: 0,
        initialized: false
      });
      variable = context.variables.get(node.variable)!;
    }

    const start = this.evaluateExpression(node.start, context);
    const end = this.evaluateExpression(node.end, context);
    const step = this.evaluateExpression(node.step, context);

    if (typeof start !== 'number' || typeof end !== 'number' || typeof step !== 'number') {
      throw new RuntimeError(`FOR loop bounds must be numbers`, node.line);
    }

    if (step === 0) {
      throw new RuntimeError(`FOR loop STEP cannot be zero`, node.line);
    }

    variable.value = Math.floor(start);
    variable.initialized = true;

    if (step > 0) {
      while (variable.value <= end) {
        for (const stmt of node.body) {
          yield* this.executeNode(stmt, context);
        }
        variable.value += Math.floor(step);
      }
    } else {
      while (variable.value >= end) {
        for (const stmt of node.body) {
          yield* this.executeNode(stmt, context);
        }
        variable.value += Math.floor(step);
      }
    }
  }

  private async* executeCase(node: CaseNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const value = this.evaluateExpression(node.expression, context);

    for (const caseBlock of node.cases) {
      let matched = false;

      if (caseBlock.value !== undefined) {
        // Single value case
        const caseValue = this.evaluateExpression(caseBlock.value, context);
        matched = (value === caseValue);
      } else if (caseBlock.rangeStart !== undefined && caseBlock.rangeEnd !== undefined) {
        // Range case (value TO value)
        const rangeStart = this.evaluateExpression(caseBlock.rangeStart, context);
        const rangeEnd = this.evaluateExpression(caseBlock.rangeEnd, context);
        
        // Convert to numbers for comparison
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        const numStart = typeof rangeStart === 'number' ? rangeStart : parseFloat(String(rangeStart));
        const numEnd = typeof rangeEnd === 'number' ? rangeEnd : parseFloat(String(rangeEnd));
        
        matched = (numValue >= numStart && numValue <= numEnd);
      }

      if (matched) {
        for (const stmt of caseBlock.statements) {
          yield* this.executeNode(stmt, context);
        }
        return;
      }
    }

    if (node.otherwiseBlock) {
      for (const stmt of node.otherwiseBlock) {
        yield* this.executeNode(stmt, context);
      }
    }
  }

  private async* executeCall(node: CallNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    // Check for procedure
    const procedure = this.globalContext.procedures.get(node.name);
    if (procedure) {
      yield* this.executeProcedure(procedure, node.arguments, context, node.line);
      return;
    }

    // Check for function (shouldn't be called with CALL, but handle it)
    const func = this.globalContext.functions.get(node.name);
    if (func) {
      throw new RuntimeError(`Use assignment to call function '${node.name}', not CALL`, node.line);
    }

    throw new RuntimeError(`Procedure '${node.name}' not found`, node.line);
  }

  private async* executeOpenFile(node: OpenFileNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const filenameValue = this.evaluateExpression(node.filename, context);
    const filename = this.valueToString(filenameValue);

    if (filename === '') {
      throw new RuntimeError(`Filename cannot be empty`, node.line);
    }

    if (this.fileHandles.has(filename)) {
      throw new RuntimeError(`File '${filename}' is already open`, node.line);
    }

    const mode = node.mode;
    let fileHandle: FileHandle;

    if (mode === 'READ') {
      if (!this.fileUploadHandler) {
        throw new RuntimeError(`Cannot open file for reading: No file upload handler available`, node.line);
      }

      const content = await this.fileUploadHandler(filename);
      const lines = content.split('\n');

      fileHandle = {
        mode: 'READ',
        data: lines,
        position: 0
      };
    } else if (mode === 'WRITE') {
      fileHandle = {
        mode: 'WRITE',
        data: [],
        position: 0
      };
    } else { // APPEND
      const existingHandle = this.fileHandles.get(filename);
      if (existingHandle) {
        fileHandle = {
          mode: 'APPEND',
          data: existingHandle.data,
          position: existingHandle.data.length
        };
      } else {
        fileHandle = {
          mode: 'APPEND',
          data: [],
          position: 0
        };
      }
    }

    this.fileHandles.set(filename, fileHandle);
    yield `Opened file '${filename}' in ${mode} mode`;
  }

  private async* executeCloseFile(node: CloseFileNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const filenameValue = this.evaluateExpression(node.filename, context);
    const filename = this.valueToString(filenameValue);

    if (filename === '') {
      throw new RuntimeError(`Filename cannot be empty`, node.line);
    }

    if (!this.fileHandles.has(filename)) {
      throw new RuntimeError(`File '${filename}' is not open`, node.line);
    }

    const fileHandle = this.fileHandles.get(filename)!;

    if (fileHandle.mode === 'WRITE' || fileHandle.mode === 'APPEND') {
      yield `Closed file '${filename}' (${fileHandle.data.length} lines written)`;
      // Keep file in fileHandles for potential APPEND operations
    } else {
      this.fileHandles.delete(filename);
      yield `Closed file '${filename}'`;
    }
  }

  private async* executeReadFile(node: ReadFileNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const filenameValue = this.evaluateExpression(node.filename, context);
    const filename = this.valueToString(filenameValue);

    if (filename === '') {
      throw new RuntimeError(`Filename cannot be empty`, node.line);
    }

    if (!this.fileHandles.has(filename)) {
      throw new RuntimeError(`File '${filename}' is not open`, node.line);
    }

    const fileHandle = this.fileHandles.get(filename)!;

    if (fileHandle.mode !== 'READ') {
      throw new RuntimeError(`File '${filename}' not opened for reading`, node.line);
    }

    if (fileHandle.position >= fileHandle.data.length) {
      throw new RuntimeError(`Attempt to read past end of file '${filename}'`, node.line);
    }

    const line = fileHandle.data[fileHandle.position];
    fileHandle.position++;

    // Store data in target variable (same logic as INPUT)
    if (node.target.type === 'Identifier') {
      const varName = (node.target as IdentifierNode).name;
      const variable = this.getVariable(varName, context);

      if (!variable) {
        throw new RuntimeError(`Variable '${varName}' not declared`, node.line);
      }

      let value: any;
      switch (variable.type) {
        case 'INTEGER':
          value = parseInt(line) || 0;
          break;
        case 'REAL':
          value = parseFloat(line) || 0.0;
          break;
        case 'BOOLEAN':
          value = line.toLowerCase() === 'true';
          break;
        default:
          value = line;
      }

      variable.value = value;
      variable.initialized = true;
    } else if (node.target.type === 'ArrayAccess') {
      const arrayAccess = node.target as ArrayAccessNode;
      const variable = this.getVariable(arrayAccess.array, context);

      if (!variable) {
        throw new RuntimeError(`Array '${arrayAccess.array}' not declared`, node.line);
      }

      if (variable.type !== 'ARRAY') {
        throw new RuntimeError(`'${arrayAccess.array}' is not an array`, node.line);
      }

      const indices = arrayAccess.indices.map(idx => {
        const val = this.evaluateExpression(idx, context);
        if (typeof val !== 'number') {
          throw new RuntimeError(`Array index must be a number`, node.line);
        }
        return Math.floor(val);
      });

      const elementType = variable.elementType || 'STRING';
      let value: any;
      switch (elementType) {
        case 'INTEGER':
          value = parseInt(line) || 0;
          break;
        case 'REAL':
          value = parseFloat(line) || 0.0;
          break;
        case 'BOOLEAN':
          value = line.toLowerCase() === 'true';
          break;
        default:
          value = line;
      }

      this.setArrayElement(variable.value, indices, value, variable.dimensions!, node.line);
    }

    yield line;
  }

  private async* executeWriteFile(node: WriteFileNode, context: ExecutionContext): AsyncGenerator<string, void, unknown> {
    const filenameValue = this.evaluateExpression(node.filename, context);
    const filename = this.valueToString(filenameValue);

    if (filename === '') {
      throw new RuntimeError(`Filename cannot be empty`, node.line);
    }

    if (!this.fileHandles.has(filename)) {
      throw new RuntimeError(`File '${filename}' is not open`, node.line);
    }

    const fileHandle = this.fileHandles.get(filename)!;

    if (fileHandle.mode === 'READ') {
      throw new RuntimeError(`File '${filename}' not opened for writing`, node.line);
    }

    const dataValue = this.evaluateExpression(node.data, context);
    const dataString = this.valueToString(dataValue);

    fileHandle.data.push(dataString);
    fileHandle.position++;

    if (this.fileWriteOutput) {
      yield `[Write to ${filename}] ${dataString}`;
    }
  }

  private async* executeProcedure(
    procedure: ProcedureNode,
    args: ExpressionNode[],
    callerContext: ExecutionContext,
    callLine: number
  ): AsyncGenerator<string, void, unknown> {
    if (args.length !== procedure.parameters.length) {
      throw new RuntimeError(`Incorrect number of arguments for procedure '${procedure.name}'`, callLine);
    }

    this.recursionDepth++;
    if (this.recursionDepth > MAX_RECURSION_DEPTH) {
      throw new RuntimeError(`Maximum recursion depth exceeded`, callLine);
    }

    const localContext: ExecutionContext = {
      variables: new Map(),
      procedures: this.globalContext.procedures,
      functions: this.globalContext.functions,
      parent: this.globalContext
    };

    // Bind parameters
    for (let i = 0; i < procedure.parameters.length; i++) {
      const param = procedure.parameters[i];
      const arg = args[i];

      if (param.byRef) {
        if (arg.type !== 'Identifier') {
          throw new RuntimeError(`BYREF parameter must be a variable`, callLine);
        }

        const varName = (arg as IdentifierNode).name;
        const variable = this.getVariable(varName, callerContext);

        if (!variable) {
          throw new RuntimeError(`Variable '${varName}' not found`, callLine);
        }

        localContext.variables.set(param.name, variable);
      } else {
        const value = this.evaluateExpression(arg, callerContext);
        localContext.variables.set(param.name, {
          type: param.type,
          value,
          initialized: true
        });
      }
    }

    // Add to call stack
    this.callStack.push({ name: procedure.name, line: callLine, type: 'procedure' });

    try {
      // Execute procedure body
      for (const stmt of procedure.body) {
        yield* this.executeNode(stmt, localContext);
      }
    } finally {
      this.callStack.pop();
      this.recursionDepth--;
    }
  }

  private executeFunction(
    func: FunctionNode,
    args: ExpressionNode[],
    callerContext: ExecutionContext,
    callLine: number
  ): any {
    if (args.length !== func.parameters.length) {
      throw new RuntimeError(`Incorrect number of arguments for function '${func.name}'`, callLine);
    }

    this.recursionDepth++;
    if (this.recursionDepth > MAX_RECURSION_DEPTH) {
      throw new RuntimeError(`Maximum recursion depth exceeded`, callLine);
    }

    const localContext: ExecutionContext = {
      variables: new Map(),
      procedures: this.globalContext.procedures,
      functions: this.globalContext.functions,
      parent: this.globalContext
    };

    // Bind parameters
    for (let i = 0; i < func.parameters.length; i++) {
      const param = func.parameters[i];
      const arg = args[i];

      if (param.byRef) {
        if (arg.type !== 'Identifier') {
          throw new RuntimeError(`BYREF parameter must be a variable`, callLine);
        }

        const varName = (arg as IdentifierNode).name;
        const variable = this.getVariable(varName, callerContext);

        if (!variable) {
          throw new RuntimeError(`Variable '${varName}' not found`, callLine);
        }

        localContext.variables.set(param.name, variable);
      } else {
        const value = this.evaluateExpression(arg, callerContext);
        localContext.variables.set(param.name, {
          type: param.type,
          value,
          initialized: true
        });
      }
    }

    try {
      // Execute function body - sync only, no yields
      for (const stmt of func.body) {
        this.executeSyncNode(stmt, localContext);
      }

      throw new RuntimeError(`Function '${func.name}' did not return a value`, callLine);
    } catch (e) {
      if (e instanceof ReturnValue) {
        return e.value;
      }
      throw e;
    } finally {
      this.recursionDepth--;
    }
  }

  private executeSyncNode(node: ASTNode, context: ExecutionContext): void {
    switch (node.type) {
      case 'Declare':
        this.executeDeclare(node as DeclareNode, context);
        break;
      case 'Assignment':
        this.executeSyncAssignment(node as AssignmentNode, context);
        break;
      case 'If':
        this.executeSyncIf(node as IfNode, context);
        break;
      case 'While':
        this.executeSyncWhile(node as WhileNode, context);
        break;
      case 'Repeat':
        this.executeSyncRepeat(node as RepeatNode, context);
        break;
      case 'For':
        this.executeSyncFor(node as ForNode, context);
        break;
      case 'Case':
        this.executeSyncCase(node as CaseNode, context);
        break;
      case 'Return':
        const returnValue = this.evaluateExpression((node as ReturnNode).value, context);
        throw new ReturnValue(returnValue);
      default:
        throw new RuntimeError(`Unsupported statement in function: ${node.type}`, node.line);
    }
  }

  private executeSyncAssignment(node: AssignmentNode, context: ExecutionContext): void {
    const value = this.evaluateExpression(node.value, context);

    if (node.target.type === 'Identifier') {
      const varName = (node.target as IdentifierNode).name;
      const variable = this.getVariable(varName, context);

      if (!variable) {
        throw new RuntimeError(`Variable '${varName}' not declared`, node.line);
      }

      variable.value = value;
      variable.initialized = true;
    } else if (node.target.type === 'ArrayAccess') {
      const arrayAccess = node.target as ArrayAccessNode;
      const variable = this.getVariable(arrayAccess.array, context);

      if (!variable) {
        throw new RuntimeError(`Array '${arrayAccess.array}' not declared`, node.line);
      }

      if (variable.type !== 'ARRAY') {
        throw new RuntimeError(`'${arrayAccess.array}' is not an array`, node.line);
      }

      const indices = arrayAccess.indices.map(idx => {
        const val = this.evaluateExpression(idx, context);
        if (typeof val !== 'number') {
          throw new RuntimeError(`Array index must be a number`, node.line);
        }
        return Math.floor(val);
      });

      this.setArrayElement(variable.value, indices, value, variable.dimensions!, node.line);
    }
  }

  private executeSyncIf(node: IfNode, context: ExecutionContext): void {
    const condition = this.evaluateExpression(node.condition, context);

    if (typeof condition !== 'boolean') {
      throw new RuntimeError(`IF condition must be boolean`, node.line);
    }

    if (condition) {
      for (const stmt of node.thenBlock) {
        this.executeSyncNode(stmt, context);
      }
    } else if (node.elseIfBlocks) {
      let executed = false;
      for (const elseIfBlock of node.elseIfBlocks) {
        const elseIfCondition = this.evaluateExpression(elseIfBlock.condition, context);

        if (typeof elseIfCondition !== 'boolean') {
          throw new RuntimeError(`ELSE IF condition must be boolean`, node.line);
        }

        if (elseIfCondition) {
          for (const stmt of elseIfBlock.block) {
            this.executeSyncNode(stmt, context);
          }
          executed = true;
          break;
        }
      }

      if (!executed && node.elseBlock) {
        for (const stmt of node.elseBlock) {
          this.executeSyncNode(stmt, context);
        }
      }
    } else if (node.elseBlock) {
      for (const stmt of node.elseBlock) {
        this.executeSyncNode(stmt, context);
      }
    }
  }

  private executeSyncWhile(node: WhileNode, context: ExecutionContext): void {
    while (true) {
      const condition = this.evaluateExpression(node.condition, context);

      if (typeof condition !== 'boolean') {
        throw new RuntimeError(`WHILE condition must be boolean`, node.line);
      }

      if (!condition) break;

      for (const stmt of node.body) {
        this.executeSyncNode(stmt, context);
      }
    }
  }

  private executeSyncRepeat(node: RepeatNode, context: ExecutionContext): void {
    do {
      for (const stmt of node.body) {
        this.executeSyncNode(stmt, context);
      }

      const condition = this.evaluateExpression(node.condition, context);

      if (typeof condition !== 'boolean') {
        throw new RuntimeError(`UNTIL condition must be boolean`, node.line);
      }

      if (condition) break;
    } while (true);
  }

  private executeSyncFor(node: ForNode, context: ExecutionContext): void {
    let variable = this.getVariable(node.variable, context);

    // Auto-declare loop variable if it doesn't exist (implicit INTEGER type)
    if (!variable) {
      context.variables.set(node.variable, {
        type: 'INTEGER',
        value: 0,
        initialized: false
      });
      variable = context.variables.get(node.variable)!;
    }

    const start = this.evaluateExpression(node.start, context);
    const end = this.evaluateExpression(node.end, context);
    const step = this.evaluateExpression(node.step, context);

    if (typeof start !== 'number' || typeof end !== 'number' || typeof step !== 'number') {
      throw new RuntimeError(`FOR loop bounds must be numbers`, node.line);
    }

    if (step === 0) {
      throw new RuntimeError(`FOR loop STEP cannot be zero`, node.line);
    }

    variable.value = Math.floor(start);
    variable.initialized = true;

    if (step > 0) {
      while (variable.value <= end) {
        for (const stmt of node.body) {
          this.executeSyncNode(stmt, context);
        }
        variable.value += Math.floor(step);
      }
    } else {
      while (variable.value >= end) {
        for (const stmt of node.body) {
          this.executeSyncNode(stmt, context);
        }
        variable.value += Math.floor(step);
      }
    }
  }

  private executeSyncCase(node: CaseNode, context: ExecutionContext): void {
    const value = this.evaluateExpression(node.expression, context);

    for (const caseBlock of node.cases) {
      let matched = false;

      if (caseBlock.value !== undefined) {
        // Single value case
        const caseValue = this.evaluateExpression(caseBlock.value, context);
        matched = (value === caseValue);
      } else if (caseBlock.rangeStart !== undefined && caseBlock.rangeEnd !== undefined) {
        // Range case (value TO value)
        const rangeStart = this.evaluateExpression(caseBlock.rangeStart, context);
        const rangeEnd = this.evaluateExpression(caseBlock.rangeEnd, context);
        
        // Convert to numbers for comparison
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        const numStart = typeof rangeStart === 'number' ? rangeStart : parseFloat(String(rangeStart));
        const numEnd = typeof rangeEnd === 'number' ? rangeEnd : parseFloat(String(rangeEnd));
        
        matched = (numValue >= numStart && numValue <= numEnd);
      }

      if (matched) {
        for (const stmt of caseBlock.statements) {
          this.executeSyncNode(stmt, context);
        }
        return;
      }
    }

    if (node.otherwiseBlock) {
      for (const stmt of node.otherwiseBlock) {
        this.executeSyncNode(stmt, context);
      }
    }
  }

  private evaluateExpression(expr: ExpressionNode, context: ExecutionContext): any {
    switch (expr.type) {
      case 'Literal':
        return (expr as LiteralNode).value;

      case 'Identifier':
        return this.evaluateIdentifier(expr as IdentifierNode, context);

      case 'ArrayAccess':
        return this.evaluateArrayAccess(expr as ArrayAccessNode, context);

      case 'BinaryOp':
        return this.evaluateBinaryOp(expr as BinaryOpNode, context);

      case 'UnaryOp':
        return this.evaluateUnaryOp(expr as UnaryOpNode, context);

      case 'FunctionCall':
        return this.evaluateFunctionCall(expr as FunctionCallNode, context);

      default:
        // This should never happen due to exhaustive checking above
        throw new RuntimeError(`Unknown expression type: ${(expr as any).type}`, (expr as any).line);
    }
  }

  private evaluateIdentifier(node: IdentifierNode, context: ExecutionContext): any {
    const variable = this.getVariable(node.name, context);

    if (!variable) {
      throw new RuntimeError(`Variable '${node.name}' not declared`, node.line);
    }

    if (!variable.initialized) {
      throw new RuntimeError(`Variable '${node.name}' used before assignment`, node.line);
    }

    return variable.value;
  }

  private evaluateArrayAccess(node: ArrayAccessNode, context: ExecutionContext): any {
    const variable = this.getVariable(node.array, context);

    if (!variable) {
      throw new RuntimeError(`Array '${node.array}' not declared`, node.line);
    }

    if (variable.type !== 'ARRAY') {
      throw new RuntimeError(`'${node.array}' is not an array`, node.line);
    }

    const indices = node.indices.map(idx => {
      const val = this.evaluateExpression(idx, context);
      if (typeof val !== 'number') {
        throw new RuntimeError(`Array index must be a number`, node.line);
      }
      return Math.floor(val);
    });

    return this.getArrayElement(variable.value, indices, variable.dimensions!, node.line);
  }

  private getArrayElement(arr: any, indices: number[], dimensions: Array<{ lower: number; upper: number }>, line: number): any {
    if (indices.length === 1) {
      const idx = indices[0];
      const { lower, upper } = dimensions[0];

      if (idx < lower || idx > upper) {
        throw new RuntimeError(`Array index out of bounds`, line);
      }

      const element = arr[idx];
      if (!element.initialized) {
        throw new RuntimeError(`Array element accessed before assignment`, line);
      }

      return element.value;
    } else {
      const idx = indices[0];
      const { lower, upper } = dimensions[0];

      if (idx < lower || idx > upper) {
        throw new RuntimeError(`Array index out of bounds`, line);
      }

      return this.getArrayElement(arr[idx], indices.slice(1), dimensions.slice(1), line);
    }
  }

  private evaluateBinaryOp(node: BinaryOpNode, context: ExecutionContext): any {
    const left = this.evaluateExpression(node.left, context);
    const right = this.evaluateExpression(node.right, context);

    switch (node.operator) {
      case '+':
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        throw new RuntimeError(`Cannot perform arithmetic on non-numbers`, node.line);

      case '-':
        if (typeof left === 'number' && typeof right === 'number') {
          return left - right;
        }
        throw new RuntimeError(`Cannot perform arithmetic on non-numbers`, node.line);

      case '*':
        if (typeof left === 'number' && typeof right === 'number') {
          return left * right;
        }
        throw new RuntimeError(`Cannot perform arithmetic on non-numbers`, node.line);

      case '/':
        if (typeof left === 'number' && typeof right === 'number') {
          if (right === 0) {
            throw new RuntimeError(`Division by zero`, node.line);
          }
          return left / right;
        }
        throw new RuntimeError(`Cannot perform arithmetic on non-numbers`, node.line);

      case 'DIV':
        if (typeof left === 'number' && typeof right === 'number') {
          if (right === 0) {
            throw new RuntimeError(`Division by zero`, node.line);
          }
          return Math.floor(left / right);
        }
        throw new RuntimeError(`Cannot perform arithmetic on non-numbers`, node.line);

      case 'MOD':
        if (typeof left === 'number' && typeof right === 'number') {
          if (right === 0) {
            throw new RuntimeError(`Division by zero`, node.line);
          }
          return left % right;
        }
        throw new RuntimeError(`Cannot perform arithmetic on non-numbers`, node.line);

      case '&':
        return this.valueToString(left) + this.valueToString(right);

      case '=':
        return left === right;

      case '<>':
        return left !== right;

      case '<':
        if (typeof left === 'number' && typeof right === 'number') {
          return left < right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left < right;
        }
        throw new RuntimeError(`Invalid comparison`, node.line);

      case '>':
        if (typeof left === 'number' && typeof right === 'number') {
          return left > right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left > right;
        }
        throw new RuntimeError(`Invalid comparison`, node.line);

      case '<=':
        if (typeof left === 'number' && typeof right === 'number') {
          return left <= right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left <= right;
        }
        throw new RuntimeError(`Invalid comparison`, node.line);

      case '>=':
        if (typeof left === 'number' && typeof right === 'number') {
          return left >= right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left >= right;
        }
        throw new RuntimeError(`Invalid comparison`, node.line);

      case 'AND':
        if (typeof left === 'boolean' && typeof right === 'boolean') {
          return left && right;
        }
        throw new RuntimeError(`Logical operators require boolean operands`, node.line);

      case 'OR':
        if (typeof left === 'boolean' && typeof right === 'boolean') {
          return left || right;
        }
        throw new RuntimeError(`Logical operators require boolean operands`, node.line);

      default:
        throw new RuntimeError(`Unknown operator: ${node.operator}`, node.line);
    }
  }

  private evaluateUnaryOp(node: UnaryOpNode, context: ExecutionContext): any {
    const operand = this.evaluateExpression(node.operand, context);

    switch (node.operator) {
      case '-':
        if (typeof operand === 'number') {
          return -operand;
        }
        throw new RuntimeError(`Cannot negate non-number`, node.line);

      case 'NOT':
        if (typeof operand === 'boolean') {
          return !operand;
        }
        throw new RuntimeError(`NOT requires boolean operand`, node.line);

      default:
        throw new RuntimeError(`Unknown unary operator: ${node.operator}`, node.line);
    }
  }

  private evaluateFunctionCall(node: FunctionCallNode, context: ExecutionContext): any {
    // Check for built-in functions
    const builtIn = this.evaluateBuiltInFunction(node.name, node.arguments, context, node.line);
    if (builtIn !== undefined) {
      return builtIn;
    }

    // Check for user-defined function
    const func = this.globalContext.functions.get(node.name);
    if (func) {
      return this.executeFunction(func, node.arguments, context, node.line);
    }

    throw new RuntimeError(`Function '${node.name}' not found`, node.line);
  }

  private evaluateBuiltInFunction(name: string, args: ExpressionNode[], context: ExecutionContext, line: number): any {
    switch (name) {
      case 'LENGTH':
        if (args.length !== 1) {
          throw new RuntimeError(`LENGTH requires 1 parameter`, line);
        }
        const str = this.evaluateExpression(args[0], context);
        if (typeof str !== 'string') {
          throw new RuntimeError(`LENGTH requires string parameter`, line);
        }
        return str.length;

      case 'SUBSTRING':
        if (args.length !== 3) {
          throw new RuntimeError(`SUBSTRING requires 3 parameters`, line);
        }
        const substr = this.evaluateExpression(args[0], context);
        const start = this.evaluateExpression(args[1], context);
        const length = this.evaluateExpression(args[2], context);

        if (typeof substr !== 'string') {
          throw new RuntimeError(`SUBSTRING parameter type mismatch`, line);
        }
        if (typeof start !== 'number' || typeof length !== 'number') {
          throw new RuntimeError(`SUBSTRING parameter type mismatch`, line);
        }
        if (start < 1) {
          throw new RuntimeError(`SUBSTRING start position must be >= 1`, line);
        }
        if (length < 0) {
          throw new RuntimeError(`SUBSTRING length cannot be negative`, line);
        }

        return substr.substring(start - 1, start - 1 + length);

      case 'UCASE':
        if (args.length !== 1) {
          throw new RuntimeError(`UCASE requires 1 parameter`, line);
        }
        const ucaseStr = this.evaluateExpression(args[0], context);
        if (typeof ucaseStr !== 'string') {
          throw new RuntimeError(`UCASE requires string parameter`, line);
        }
        return ucaseStr.toUpperCase();

      case 'LCASE':
        if (args.length !== 1) {
          throw new RuntimeError(`LCASE requires 1 parameter`, line);
        }
        const lcaseStr = this.evaluateExpression(args[0], context);
        if (typeof lcaseStr !== 'string') {
          throw new RuntimeError(`LCASE requires string parameter`, line);
        }
        return lcaseStr.toLowerCase();

      case 'INT':
        if (args.length !== 1) {
          throw new RuntimeError(`INT requires 1 parameter`, line);
        }
        const intVal = this.evaluateExpression(args[0], context);
        if (typeof intVal === 'number') {
          return Math.floor(intVal);
        }
        if (typeof intVal === 'string') {
          const parsed = parseInt(intVal);
          return isNaN(parsed) ? 0 : parsed;
        }
        if (typeof intVal === 'boolean') {
          return intVal ? 1 : 0;
        }
        return 0;

      case 'REAL':
        if (args.length !== 1) {
          throw new RuntimeError(`REAL requires 1 parameter`, line);
        }
        const realVal = this.evaluateExpression(args[0], context);
        if (typeof realVal === 'number') {
          return realVal;
        }
        if (typeof realVal === 'string') {
          const parsed = parseFloat(realVal);
          return isNaN(parsed) ? 0.0 : parsed;
        }
        if (typeof realVal === 'boolean') {
          return realVal ? 1.0 : 0.0;
        }
        return 0.0;

      case 'STRING':
        if (args.length !== 1) {
          throw new RuntimeError(`STRING requires 1 parameter`, line);
        }
        const strVal = this.evaluateExpression(args[0], context);
        return this.valueToString(strVal);

      case 'ROUND':
        if (args.length !== 2) {
          throw new RuntimeError(`ROUND requires 2 parameters`, line);
        }
        const roundVal = this.evaluateExpression(args[0], context);
        const decimals = this.evaluateExpression(args[1], context);

        if (typeof roundVal !== 'number' || typeof decimals !== 'number') {
          throw new RuntimeError(`ROUND parameter type mismatch`, line);
        }

        const multiplier = Math.pow(10, decimals);
        return Math.round(roundVal * multiplier) / multiplier;

      case 'RANDOM':
        if (args.length !== 0) {
          throw new RuntimeError(`RANDOM takes no parameters`, line);
        }
        return Math.random();

      case 'EOF':
        if (args.length !== 1) {
          throw new RuntimeError(`EOF requires 1 parameter`, line);
        }
        const filename = this.valueToString(this.evaluateExpression(args[0], context));
        
        if (filename === '') {
          throw new RuntimeError(`Filename cannot be empty`, line);
        }
        
        const fileHandle = this.fileHandles.get(filename);
        
        if (!fileHandle) {
          throw new RuntimeError(`File '${filename}' is not open`, line);
        }
        
        if (fileHandle.mode !== 'READ') {
          throw new RuntimeError(`EOF can only be used with files opened for reading`, line);
        }
        
        return fileHandle.position >= fileHandle.data.length;

      default:
        return undefined;
    }
  }

  private getVariable(name: string, context: ExecutionContext): Variable | undefined {
    let current: ExecutionContext | undefined = context;

    while (current) {
      if (current.variables.has(name)) {
        return current.variables.get(name);
      }
      current = current.parent;
    }

    return undefined;
  }

  private valueToString(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }
}
