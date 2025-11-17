/**
 * Parser for IGCSE/A-LEVELS pseudocode
 * Converts tokens into Abstract Syntax Tree (AST)
 */

import {
  Token,
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
  AddressOfNode,
  DereferenceNode,
  MemoryAllocationNode,
  SizeOfNode,
  FunctionCallNode,
  DataType,
  Parameter
} from './types';

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    // Filter out comments and empty newlines
    this.tokens = tokens.filter(t => t.type !== 'COMMENT');
  }

  parse(): ASTNode[] {
    const statements: ASTNode[] = [];

    while (!this.isAtEnd()) {
      this.skipNewlines();
      if (this.isAtEnd()) break;

      // Special handling for DECLARE to support comma-separated identifiers
      if (this.check('KEYWORD') && this.peek().value === 'DECLARE') {
        const declareNodes = this.parseDeclareStatements();
        statements.push(...declareNodes);
      } else {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      }
      this.skipNewlines();
    }

    return statements;
  }

  private parseDeclareStatements(): DeclareNode[] {
    const line = this.advance().line; // consume DECLARE
    const nodes: DeclareNode[] = [];

    // Collect all identifiers (comma-separated)
    const identifiers: string[] = [];
    identifiers.push(this.consume('IDENTIFIER', 'Expected identifier after DECLARE').value);

    while (this.check('COMMA')) {
      this.advance(); // consume comma
      identifiers.push(this.consume('IDENTIFIER', 'Expected identifier after comma').value);
    }

    this.consume('COLON', 'Expected : after identifier(s) in DECLARE');

    // Check for ARRAY
    if (this.check('KEYWORD') && this.peek().value === 'ARRAY') {
      this.advance(); // consume ARRAY

      // Parse bounds
      this.consume('LBRACKET', 'Expected [ after ARRAY');
      const dimensions: Array<{ lower: number; upper: number }> = [];

      do {
        const lowerExpr = this.parseExpression();
        if (lowerExpr.type !== 'Literal') {
          throw new Error(`Array bounds must be literal numbers at line ${line}`);
        }
        const lower = parseInt((lowerExpr as LiteralNode).value);

        this.consume('COLON', 'Expected : in array bounds');

        const upperExpr = this.parseExpression();
        if (upperExpr.type !== 'Literal') {
          throw new Error(`Array bounds must be literal numbers at line ${line}`);
        }
        const upper = parseInt((upperExpr as LiteralNode).value);

        dimensions.push({ lower, upper });

        if (this.check('COMMA')) {
          this.advance();
        } else {
          break;
        }
      } while (true);

      this.consume('RBRACKET', 'Expected ] after array bounds');
      this.consume('KEYWORD', 'Expected OF after array bounds');
      if (this.previous().value !== 'OF') {
        throw new Error(`Expected OF after array bounds at line ${line}`);
      }

      const elementType = this.parseDataType();

      // Create a DeclareNode for each identifier with array type
      for (const identifier of identifiers) {
        nodes.push({
          type: 'Declare',
          identifier,
          dataType: 'ARRAY',
          arrayBounds: { dimensions },
          arrayElementType: elementType,
          line
        });
      }
    } else {
      // Regular variable
      const dataType = this.parseDataType();

      // Create a DeclareNode for each identifier
      for (const identifier of identifiers) {
        nodes.push({
          type: 'Declare',
          identifier,
          dataType,
          line
        });
      }
    }

    return nodes;
  }

  private parseStatement(): ASTNode | null {
    const token = this.peek();

    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'OUTPUT':
          return this.parseOutput();
        case 'INPUT':
          return this.parseInput();
        case 'IF':
          return this.parseIf();
        case 'WHILE':
          return this.parseWhile();
        case 'REPEAT':
          return this.parseRepeat();
        case 'FOR':
          return this.parseFor();
        case 'CASE':
          return this.parseCase();
        case 'PROCEDURE':
          return this.parseProcedure();
        case 'FUNCTION':
          return this.parseFunction();
        case 'CALL':
          return this.parseCall();
        case 'RETURN':
          return this.parseReturn();
        case 'CONSTANT':
          throw new Error(`Feature not supported: ${token.value} at line ${token.line}`);
        case 'OPENFILE':
          return this.parseOpenFile();
        case 'CLOSEFILE':
          return this.parseCloseFile();
        case 'READFILE':
          return this.parseReadFile();
        case 'WRITEFILE':
          return this.parseWriteFile();
        case 'FREE':
          return this.parseMemoryFree();
        default:
          throw new Error(`Unexpected keyword '${token.value}' at line ${token.line}`);
      }
    }

    // Check for assignment
    if (token.type === 'IDENTIFIER') {
      return this.parseAssignment();
    }

    if (token.type === 'NEWLINE') {
      return null;
    }

    throw new Error(`Unexpected token '${token.value}' at line ${token.line}`);
  }

  private parseAssignment(): AssignmentNode {
    const line = this.peek().line;

    // Parse target (identifier or array access)
    let target: IdentifierNode | ArrayAccessNode;

    const identifier = this.advance().value;

    if (this.check('LBRACKET')) {
      // Array access
      this.advance(); // consume [
      const indices: ExpressionNode[] = [];

      do {
        indices.push(this.parseExpression());
        if (this.check('COMMA')) {
          this.advance();
        } else {
          break;
        }
      } while (true);

      this.consume('RBRACKET', 'Expected ] after array indices');

      target = {
        type: 'ArrayAccess',
        array: identifier,
        indices,
        line
      };
    } else {
      target = {
        type: 'Identifier',
        name: identifier,
        line
      };
    }

    this.consume('ASSIGNMENT', 'Expected <- in assignment');
    const value = this.parseExpression();

    return {
      type: 'Assignment',
      target,
      value,
      line
    };
  }

  private parseOutput(): OutputNode {
    const line = this.advance().line; // consume OUTPUT

    const expressions: ExpressionNode[] = [];

    do {
      expressions.push(this.parseExpression());
      if (this.check('COMMA')) {
        this.advance();
      } else {
        break;
      }
    } while (true);

    return {
      type: 'Output',
      expressions,
      line
    };
  }

  private parseInput(): InputNode {
    const line = this.advance().line; // consume INPUT
    
    // Parse target (identifier or array access)
    let target: IdentifierNode | ArrayAccessNode;

    const identifier = this.consume('IDENTIFIER', 'Expected identifier after INPUT').value;

    if (this.check('LBRACKET')) {
      // Array access
      this.advance(); // consume [
      const indices: ExpressionNode[] = [];

      do {
        indices.push(this.parseExpression());
        if (this.check('COMMA')) {
          this.advance();
        } else {
          break;
        }
      } while (true);

      this.consume('RBRACKET', 'Expected ] after array indices');

      target = {
        type: 'ArrayAccess',
        array: identifier,
        indices,
        line
      };
    } else {
      target = {
        type: 'Identifier',
        name: identifier,
        line
      };
    }

    return {
      type: 'Input',
      target,
      line
    };
  }

  private parseIf(): IfNode {
    const line = this.advance().line; // consume IF

    const condition = this.parseExpression();
    this.consume('KEYWORD', 'Expected THEN after IF condition');
    if (this.previous().value !== 'THEN') {
      throw new Error(`Expected THEN after IF condition at line ${line}`);
    }

    this.skipNewlines();
    const thenBlock = this.parseBlock(['ELSE', 'ENDIF']);

    const elseIfBlocks: Array<{ condition: ExpressionNode; block: ASTNode[] }> = [];
    let elseBlock: ASTNode[] | undefined;

    while (this.check('KEYWORD') && this.peek().value === 'ELSE') {
      this.advance(); // consume ELSE

      if (this.check('KEYWORD') && this.peek().value === 'IF') {
        this.advance(); // consume IF

        const elseIfCondition = this.parseExpression();
        this.consume('KEYWORD', 'Expected THEN after ELSE IF condition');
        if (this.previous().value !== 'THEN') {
          throw new Error(`Expected THEN after ELSE IF condition at line ${this.previous().line}`);
        }

        this.skipNewlines();
        const elseIfBlock = this.parseBlock(['ELSE', 'ENDIF']);
        elseIfBlocks.push({ condition: elseIfCondition, block: elseIfBlock });
      } else {
        this.skipNewlines();
        elseBlock = this.parseBlock(['ENDIF']);
        break;
      }
    }

    this.consume('KEYWORD', 'Expected ENDIF to close IF statement');
    if (this.previous().value !== 'ENDIF') {
      throw new Error(`Expected ENDIF to close IF statement at line ${line}`);
    }

    return {
      type: 'If',
      condition,
      thenBlock,
      elseIfBlocks: elseIfBlocks.length > 0 ? elseIfBlocks : undefined,
      elseBlock,
      line
    };
  }

  private parseWhile(): WhileNode {
    const line = this.advance().line; // consume WHILE

    const condition = this.parseExpression();
    this.consume('KEYWORD', 'Expected DO after WHILE condition');
    if (this.previous().value !== 'DO') {
      throw new Error(`Expected DO after WHILE condition at line ${line}`);
    }

    this.skipNewlines();
    const body = this.parseBlock(['ENDWHILE']);

    this.consume('KEYWORD', 'Expected ENDWHILE to close WHILE loop');
    if (this.previous().value !== 'ENDWHILE') {
      throw new Error(`Expected ENDWHILE to close WHILE loop at line ${line}`);
    }

    return {
      type: 'While',
      condition,
      body,
      line
    };
  }

  private parseRepeat(): RepeatNode {
    const line = this.advance().line; // consume REPEAT

    this.skipNewlines();
    const body = this.parseBlock(['UNTIL']);

    this.consume('KEYWORD', 'Expected UNTIL after REPEAT block');
    if (this.previous().value !== 'UNTIL') {
      throw new Error(`Expected UNTIL after REPEAT block at line ${line}`);
    }

    const condition = this.parseExpression();

    return {
      type: 'Repeat',
      body,
      condition,
      line
    };
  }

  private parseFor(): ForNode {
    const line = this.advance().line; // consume FOR

    const variable = this.consume('IDENTIFIER', 'Expected variable name after FOR').value;
    this.consume('ASSIGNMENT', 'Expected <- after FOR variable');

    const start = this.parseExpression();

    this.consume('KEYWORD', 'Expected TO in FOR loop');
    if (this.previous().value !== 'TO') {
      throw new Error(`Expected TO in FOR loop at line ${line}`);
    }

    const end = this.parseExpression();

    // Check for STEP
    let step: ExpressionNode = {
      type: 'Literal',
      value: 1,
      dataType: 'INTEGER',
      line
    };

    if (this.check('KEYWORD') && this.peek().value === 'STEP') {
      this.advance(); // consume STEP
      step = this.parseExpression();
    }

    this.skipNewlines();
    const body = this.parseBlock(['NEXT']);

    this.consume('KEYWORD', 'Expected NEXT to close FOR loop');
    if (this.previous().value !== 'NEXT') {
      throw new Error(`Expected NEXT to close FOR loop at line ${line}`);
    }

    const nextVar = this.consume('IDENTIFIER', 'Expected variable name after NEXT').value;
    if (nextVar !== variable) {
      throw new Error(`NEXT identifier does not match FOR at line ${this.previous().line}`);
    }

    return {
      type: 'For',
      variable,
      start,
      end,
      step,
      body,
      line
    };
  }

  private parseCase(): CaseNode {
    const line = this.advance().line; // consume CASE

    this.consume('KEYWORD', 'Expected OF after CASE');
    if (this.previous().value !== 'OF') {
      throw new Error(`Expected OF after CASE at line ${line}`);
    }

    const expression = this.parseExpression();

    this.skipNewlines();

    const cases: Array<{ 
      value?: ExpressionNode; 
      rangeStart?: ExpressionNode;
      rangeEnd?: ExpressionNode;
      statements: ASTNode[] 
    }> = [];
    let otherwiseBlock: ASTNode[] | undefined;

    while (!this.check('KEYWORD') || (this.peek().value !== 'ENDCASE')) {
      this.skipNewlines();

      if (this.check('KEYWORD') && this.peek().value === 'OTHERWISE') {
        this.advance(); // consume OTHERWISE
        this.consume('COLON', 'Expected : after OTHERWISE');
        this.skipNewlines();
        otherwiseBlock = this.parseBlock(['ENDCASE']);
        break;
      }

      if (this.check('KEYWORD') && this.peek().value === 'ENDCASE') {
        break;
      }

      const caseValue = this.parseExpression();
      
      // Check for range (value TO value)
      let rangeStart: ExpressionNode | undefined;
      let rangeEnd: ExpressionNode | undefined;
      let singleValue: ExpressionNode | undefined;
      
      if (this.check('KEYWORD') && this.peek().value === 'TO') {
        this.advance(); // consume TO
        rangeStart = caseValue;
        rangeEnd = this.parseExpression();
      } else {
        singleValue = caseValue;
      }
      
      this.consume('COLON', 'Expected : after case value');
      this.skipNewlines();

      const statements: ASTNode[] = [];
      while (!this.isAtEnd() && !this.check('KEYWORD')) {
        this.skipNewlines();
        if (this.isAtEnd()) break;

        // Check if next line starts with a case value or OTHERWISE/ENDCASE
        if (this.check('NUMBER') || this.check('STRING') ||
            (this.check('KEYWORD') && (this.peek().value === 'TRUE' || this.peek().value === 'FALSE' ||
                                       this.peek().value === 'OTHERWISE' || this.peek().value === 'ENDCASE'))) {
          break;
        }

        // Special handling for DECLARE
        if (this.check('KEYWORD') && this.peek().value === 'DECLARE') {
          const declareNodes = this.parseDeclareStatements();
          statements.push(...declareNodes);
        } else {
          const stmt = this.parseStatement();
          if (stmt) {
            statements.push(stmt);
          }
        }
        this.skipNewlines();
      }

      cases.push({ 
        value: singleValue, 
        rangeStart, 
        rangeEnd, 
        statements 
      });
    }

    this.consume('KEYWORD', 'Expected ENDCASE to close CASE statement');
    if (this.previous().value !== 'ENDCASE') {
      throw new Error(`Expected ENDCASE to close CASE statement at line ${line}`);
    }

    return {
      type: 'Case',
      expression,
      cases,
      otherwiseBlock,
      line
    };
  }

  private parseProcedure(): ProcedureNode {
    const line = this.advance().line; // consume PROCEDURE

    const name = this.consume('IDENTIFIER', 'Expected procedure name').value;
    this.consume('LPAREN', 'Expected ( after procedure name');

    const parameters = this.parseParameters();

    this.consume('RPAREN', 'Expected ) after parameters');

    this.skipNewlines();
    const body = this.parseBlock(['ENDPROCEDURE']);

    this.consume('KEYWORD', 'Expected ENDPROCEDURE');
    if (this.previous().value !== 'ENDPROCEDURE') {
      throw new Error(`Expected ENDPROCEDURE at line ${line}`);
    }

    return {
      type: 'Procedure',
      name,
      parameters,
      body,
      line
    };
  }

  private parseFunction(): FunctionNode {
    const line = this.advance().line; // consume FUNCTION

    const name = this.consume('IDENTIFIER', 'Expected function name').value;
    this.consume('LPAREN', 'Expected ( after function name');

    const parameters = this.parseParameters();

    this.consume('RPAREN', 'Expected ) after parameters');

    this.consume('KEYWORD', 'Expected RETURNS after function parameters');
    if (this.previous().value !== 'RETURNS') {
      throw new Error(`Expected RETURNS after function parameters at line ${line}`);
    }

    const returnType = this.parseDataType();

    this.skipNewlines();
    const body = this.parseBlock(['ENDFUNCTION']);

    this.consume('KEYWORD', 'Expected ENDFUNCTION');
    if (this.previous().value !== 'ENDFUNCTION') {
      throw new Error(`Expected ENDFUNCTION at line ${line}`);
    }

    return {
      type: 'Function',
      name,
      parameters,
      returnType,
      body,
      line
    };
  }

  private parseCall(): CallNode {
    const line = this.advance().line; // consume CALL

    const name = this.consume('IDENTIFIER', 'Expected procedure name after CALL').value;
    this.consume('LPAREN', 'Expected ( after procedure name');

    const args: ExpressionNode[] = [];

    if (!this.check('RPAREN')) {
      do {
        args.push(this.parseExpression());
        if (this.check('COMMA')) {
          this.advance();
        } else {
          break;
        }
      } while (true);
    }

    this.consume('RPAREN', 'Expected ) after arguments');

    return {
      type: 'Call',
      name,
      arguments: args,
      line
    };
  }

  private parseReturn(): ReturnNode {
    const line = this.advance().line; // consume RETURN

    const value = this.parseExpression();

    return {
      type: 'Return',
      value,
      line
    };
  }

  private parseOpenFile(): OpenFileNode {
    const line = this.advance().line; // consume OPENFILE

    const filename = this.parseExpression();

    this.consume('KEYWORD', 'Expected FOR after filename in OPENFILE');
    if (this.previous().value !== 'FOR') {
      throw new Error(`Expected FOR after filename in OPENFILE at line ${line}`);
    }

    const modeToken = this.consume('KEYWORD', 'Expected file mode (READ, WRITE, or APPEND) after FOR');
    const mode = modeToken.value;

    if (mode !== 'READ' && mode !== 'WRITE' && mode !== 'APPEND') {
      throw new Error(`Invalid file mode, expected READ, WRITE, or APPEND at line ${modeToken.line}`);
    }

    return {
      type: 'OpenFile',
      filename,
      mode: mode as 'READ' | 'WRITE' | 'APPEND',
      line
    };
  }

  private parseCloseFile(): CloseFileNode {
    const line = this.advance().line; // consume CLOSEFILE

    const filename = this.parseExpression();

    return {
      type: 'CloseFile',
      filename,
      line
    };
  }

  private parseReadFile(): ReadFileNode {
    const line = this.advance().line; // consume READFILE

    const filename = this.parseExpression();

    this.consume('COMMA', 'Expected , after filename in READFILE');

    // Parse target (identifier or array access) - same as INPUT
    let target: IdentifierNode | ArrayAccessNode;

    const identifier = this.consume('IDENTIFIER', 'Expected identifier after , in READFILE').value;

    if (this.check('LBRACKET')) {
      // Array access
      this.advance(); // consume [
      const indices: ExpressionNode[] = [];

      do {
        indices.push(this.parseExpression());
        if (this.check('COMMA')) {
          this.advance();
        } else {
          break;
        }
      } while (true);

      this.consume('RBRACKET', 'Expected ] after array indices');

      target = {
        type: 'ArrayAccess',
        array: identifier,
        indices,
        line
      };
    } else {
      target = {
        type: 'Identifier',
        name: identifier,
        line
      };
    }

    return {
      type: 'ReadFile',
      filename,
      target,
      line
    };
  }

  private parseWriteFile(): WriteFileNode {
    const line = this.advance().line; // consume WRITEFILE

    const filename = this.parseExpression();

    this.consume('COMMA', 'Expected , after filename in WRITEFILE');

    const data = this.parseExpression();

    return {
      type: 'WriteFile',
      filename,
      data,
      line
    };
  }

  private parseMemoryFree(): MemoryFreeNode {
    const line = this.advance().line; // consume FREE

    const pointer = this.parseExpression();

    return {
      type: 'MemoryFree',
      pointer,
      line
    };
  }

  private parseParameters(): Parameter[] {
    const parameters: Parameter[] = [];

    if (this.check('RPAREN')) {
      return parameters;
    }

    do {
      let byRef = false;

      if (this.check('KEYWORD') && this.peek().value === 'BYREF') {
        byRef = true;
        this.advance();
      } else if (this.check('KEYWORD') && this.peek().value === 'BYVAL') {
        this.advance();
      }

      const name = this.consume('IDENTIFIER', 'Expected parameter name').value;
      this.consume('COLON', 'Expected : after parameter name');
      const type = this.parseDataType();

      let arrayElementType: DataType | undefined;
      
      // If type is ARRAY, check for "OF TYPE"
      if (type === 'ARRAY') {
        const ofToken = this.consume('KEYWORD', 'Expected OF after ARRAY');
        if (ofToken.value !== 'OF') {
          throw new Error(`Expected OF after ARRAY at line ${ofToken.line}`);
        }
        arrayElementType = this.parseDataType();
      }

      parameters.push({ name, type, byRef, arrayElementType });

      if (this.check('COMMA')) {
        this.advance();
      } else {
        break;
      }
    } while (true);

    return parameters;
  }

  private parseDataType(): DataType {
    const token = this.consume('KEYWORD', 'Expected data type');
    const type = token.value;

    if (['INTEGER', 'REAL', 'STRING', 'CHAR', 'BOOLEAN'].includes(type)) {
      return type as DataType;
    }

    if (type === 'ARRAY') {
      return 'ARRAY' as DataType;
    }

    // Pointer types
    if (['POINTER_TO_INTEGER', 'POINTER_TO_REAL', 'POINTER_TO_CHAR', 'VOID_POINTER'].includes(type)) {
      return type as DataType;
    }

    throw new Error(`Invalid data type '${type}' at line ${token.line}`);
  }

  private parseBlock(endKeywords: string[]): ASTNode[] {
    const statements: ASTNode[] = [];

    while (!this.isAtEnd()) {
      this.skipNewlines();

      if (this.check('KEYWORD') && endKeywords.includes(this.peek().value)) {
        break;
      }

      if (this.isAtEnd()) break;

      // Special handling for DECLARE to support comma-separated identifiers
      if (this.check('KEYWORD') && this.peek().value === 'DECLARE') {
        const declareNodes = this.parseDeclareStatements();
        statements.push(...declareNodes);
      } else {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      }
    }

    return statements;
  }

  // Expression parsing with operator precedence
  private parseExpression(): ExpressionNode {
    return this.parseOr();
  }

  private parseOr(): ExpressionNode {
    let expr = this.parseAnd();

    while (this.check('KEYWORD') && this.peek().value === 'OR') {
      const op = this.advance();
      const right = this.parseAnd();
      expr = {
        type: 'BinaryOp',
        operator: 'OR',
        left: expr,
        right,
        line: op.line
      };
    }

    return expr;
  }

  private parseAnd(): ExpressionNode {
    let expr = this.parseNot();

    while (this.check('KEYWORD') && this.peek().value === 'AND') {
      const op = this.advance();
      const right = this.parseNot();
      expr = {
        type: 'BinaryOp',
        operator: 'AND',
        left: expr,
        right,
        line: op.line
      };
    }

    return expr;
  }

  private parseNot(): ExpressionNode {
    if (this.check('KEYWORD') && this.peek().value === 'NOT') {
      const op = this.advance();
      const operand = this.parseNot();
      return {
        type: 'UnaryOp',
        operator: 'NOT',
        operand,
        line: op.line
      };
    }

    return this.parseComparison();
  }

  private parseComparison(): ExpressionNode {
    let expr = this.parseTerm();

    while (this.check('OPERATOR') && ['=', '<>', '<', '>', '<=', '>='].includes(this.peek().value)) {
      const op = this.advance();
      const right = this.parseTerm();
      expr = {
        type: 'BinaryOp',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }

    return expr;
  }

  private parseTerm(): ExpressionNode {
    let expr = this.parseFactor();

    while (this.check('OPERATOR') && ['+', '-', '&'].includes(this.peek().value)) {
      const op = this.advance();
      const right = this.parseFactor();
      expr = {
        type: 'BinaryOp',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }

    return expr;
  }

  private parseFactor(): ExpressionNode {
    let expr = this.parseUnary();

    while ((this.check('OPERATOR') && ['*', '/'].includes(this.peek().value)) ||
           (this.check('KEYWORD') && ['DIV', 'MOD'].includes(this.peek().value))) {
      const op = this.advance();
      const right = this.parseUnary();
      expr = {
        type: 'BinaryOp',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }

    return expr;
  }

  private parseUnary(): ExpressionNode {
    if (this.check('OPERATOR') && this.peek().value === '-') {
      const op = this.advance();
      const operand = this.parseUnary();
      return {
        type: 'UnaryOp',
        operator: '-',
        operand,
        line: op.line
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionNode {
    const token = this.peek();

    // Address-of operator (&)
    if (token.type === 'OPERATOR' && token.value === '&') {
      const op = this.advance();
      const operand = this.parsePrimary();
      if (operand.type !== 'Identifier') {
        throw new Error(`& operator requires identifier at line ${op.line}`);
      }
      return {
        type: 'AddressOf',
        target: operand as IdentifierNode,
        line: op.line
      };
    }

    // Dereference operator (*)
    if (token.type === 'OPERATOR' && token.value === '*') {
      const op = this.advance();
      const operand = this.parsePrimary();
      return {
        type: 'Dereference',
        pointer: operand,
        line: op.line
      };
    }

    // Literals
    if (token.type === 'NUMBER') {
      this.advance();
      const value = token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value);
      const dataType = token.value.includes('.') ? 'REAL' : 'INTEGER';
      return {
        type: 'Literal',
        value,
        dataType,
        line: token.line
      };
    }

    if (token.type === 'STRING') {
      this.advance();
      return {
        type: 'Literal',
        value: token.value,
        dataType: 'STRING',
        line: token.line
      };
    }

    if (token.type === 'KEYWORD' && token.value === 'TRUE') {
      this.advance();
      return {
        type: 'Literal',
        value: true,
        dataType: 'BOOLEAN',
        line: token.line
      };
    }

    if (token.type === 'KEYWORD' && token.value === 'FALSE') {
      this.advance();
      return {
        type: 'Literal',
        value: false,
        dataType: 'BOOLEAN',
        line: token.line
      };
    }

    // Parenthesized expression
    if (token.type === 'LPAREN') {
      this.advance();
      const expr = this.parseExpression();
      this.consume('RPAREN', 'Expected ) after expression');
      return expr;
    }

    // Special function calls (MALLOC, SIZE_OF, and type conversion functions)
    if (token.type === 'KEYWORD' && ['INT', 'REAL', 'STRING', 'MALLOC', 'SIZE_OF'].includes(token.value)) {
      if (this.tokens[this.current + 1]?.type === 'LPAREN') {
        const name = this.advance().value;
        this.advance(); // consume (

        const args: ExpressionNode[] = [];

        if (!this.check('RPAREN')) {
          do {
            args.push(this.parseExpression());
            if (this.check('COMMA')) {
              this.advance();
            } else {
              break;
            }
          } while (true);
        }

        this.consume('RPAREN', 'Expected ) after function arguments');

        // Handle special cases
        if (name === 'MALLOC') {
          // MALLOC expects size argument and returns a pointer
          if (args.length !== 1) {
            throw new Error(`MALLOC expects exactly 1 argument at line ${token.line}`);
          }
          return {
            type: 'MemoryAllocation',
            size: args[0],
            targetType: 'VOID_POINTER', // Default type, can be cast later
            line: token.line
          };
        }

        if (name === 'SIZE_OF') {
          // SIZE_OF expects a type argument
          if (args.length !== 1 || args[0].type !== 'Identifier') {
            throw new Error(`SIZE_OF expects a type identifier at line ${token.line}`);
          }
          const typeName = (args[0] as IdentifierNode).name;
          return {
            type: 'SizeOf',
            dataType: typeName as DataType,
            line: token.line
          };
        }

        // Regular function call for INT, REAL, STRING
        return {
          type: 'FunctionCall',
          name,
          arguments: args,
          line: token.line
        };
      }
    }

    // Identifier, function call, or array access
    if (token.type === 'IDENTIFIER') {
      const name = this.advance().value;

      // Function call
      if (this.check('LPAREN')) {
        this.advance(); // consume (

        const args: ExpressionNode[] = [];

        if (!this.check('RPAREN')) {
          do {
            args.push(this.parseExpression());
            if (this.check('COMMA')) {
              this.advance();
            } else {
              break;
            }
          } while (true);
        }

        this.consume('RPAREN', 'Expected ) after function arguments');

        return {
          type: 'FunctionCall',
          name,
          arguments: args,
          line: token.line
        };
      }

      // Array access
      if (this.check('LBRACKET')) {
        this.advance(); // consume [

        const indices: ExpressionNode[] = [];

        do {
          indices.push(this.parseExpression());
          if (this.check('COMMA')) {
            this.advance();
          } else {
            break;
          }
        } while (true);

        this.consume('RBRACKET', 'Expected ] after array indices');

        return {
          type: 'ArrayAccess',
          array: name,
          indices,
          line: token.line
        };
      }

      // Simple identifier
      return {
        type: 'Identifier',
        name,
        line: token.line
      };
    }

    throw new Error(`Unexpected token '${token.value}' at line ${token.line}`);
  }

  // Helper methods
  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private check(type: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private consume(type: string, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new Error(`${message} at line ${this.peek().line}`);
  }

  private skipNewlines(): void {
    while (this.check('NEWLINE') && !this.isAtEnd()) {
      this.advance();
    }
  }
}

export function parse(tokens: Token[]): ASTNode[] {
  const parser = new Parser(tokens);
  return parser.parse();
}
