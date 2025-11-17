/**
 * Type definitions for the IGCSE/A-LEVELS pseudocode interpreter
 */

// Token types for lexer
export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'ASSIGNMENT'
  | 'COMMA'
  | 'COLON'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'NEWLINE'
  | 'EOF'
  | 'COMMENT';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

// Data types
export type DataType = 'INTEGER' | 'REAL' | 'STRING' | 'CHAR' | 'BOOLEAN' | 'ARRAY' |
                      'POINTER_TO_INTEGER' | 'POINTER_TO_REAL' | 'POINTER_TO_CHAR' | 'VOID_POINTER';

// AST Node types
export type ASTNode =
  | DeclareNode
  | AssignmentNode
  | OutputNode
  | InputNode
  | IfNode
  | WhileNode
  | RepeatNode
  | ForNode
  | CaseNode
  | ProcedureNode
  | FunctionNode
  | CallNode
  | ReturnNode
  | OpenFileNode
  | CloseFileNode
  | ReadFileNode
  | WriteFileNode
  | MemoryFreeNode
  | ExpressionNode;

export type ExpressionNode =
  | BinaryOpNode
  | UnaryOpNode
  | LiteralNode
  | IdentifierNode
  | ArrayAccessNode
  | FunctionCallNode
  | AddressOfNode
  | DereferenceNode
  | PointerCastNode
  | MemoryAllocationNode
  | SizeOfNode;

export interface BaseNode {
  type: string;
  line: number;
}

export interface DeclareNode extends BaseNode {
  type: 'Declare';
  identifier: string;
  dataType: DataType;
  arrayBounds?: ArrayBounds;
  arrayElementType?: DataType;
}

export interface ArrayBounds {
  dimensions: Array<{ lower: number; upper: number }>;
}

export interface AssignmentNode extends BaseNode {
  type: 'Assignment';
  target: IdentifierNode | ArrayAccessNode;
  value: ExpressionNode;
}

export interface OutputNode extends BaseNode {
  type: 'Output';
  expressions: ExpressionNode[];
}

export interface InputNode extends BaseNode {
  type: 'Input';
  target: IdentifierNode | ArrayAccessNode;
}

export interface IfNode extends BaseNode {
  type: 'If';
  condition: ExpressionNode;
  thenBlock: ASTNode[];
  elseIfBlocks?: Array<{ condition: ExpressionNode; block: ASTNode[] }>;
  elseBlock?: ASTNode[];
}

export interface WhileNode extends BaseNode {
  type: 'While';
  condition: ExpressionNode;
  body: ASTNode[];
}

export interface RepeatNode extends BaseNode {
  type: 'Repeat';
  body: ASTNode[];
  condition: ExpressionNode;
}

export interface ForNode extends BaseNode {
  type: 'For';
  variable: string;
  start: ExpressionNode;
  end: ExpressionNode;
  step: ExpressionNode;
  body: ASTNode[];
}

export interface CaseNode extends BaseNode {
  type: 'Case';
  expression: ExpressionNode;
  cases: Array<{ 
    value?: ExpressionNode; 
    rangeStart?: ExpressionNode;
    rangeEnd?: ExpressionNode;
    statements: ASTNode[] 
  }>;
  otherwiseBlock?: ASTNode[];
}

export interface ProcedureNode extends BaseNode {
  type: 'Procedure';
  name: string;
  parameters: Parameter[];
  body: ASTNode[];
}

export interface FunctionNode extends BaseNode {
  type: 'Function';
  name: string;
  parameters: Parameter[];
  returnType: DataType;
  body: ASTNode[];
}

export interface Parameter {
  name: string;
  type: DataType;
  byRef: boolean;
  arrayElementType?: DataType;
}

export interface CallNode extends BaseNode {
  type: 'Call';
  name: string;
  arguments: ExpressionNode[];
}

export interface ReturnNode extends BaseNode {
  type: 'Return';
  value: ExpressionNode;
}

export interface OpenFileNode extends BaseNode {
  type: 'OpenFile';
  filename: ExpressionNode;
  mode: 'READ' | 'WRITE' | 'APPEND';
}

export interface CloseFileNode extends BaseNode {
  type: 'CloseFile';
  filename: ExpressionNode;
}

export interface ReadFileNode extends BaseNode {
  type: 'ReadFile';
  filename: ExpressionNode;
  target: IdentifierNode | ArrayAccessNode;
}

export interface WriteFileNode extends BaseNode {
  type: 'WriteFile';
  filename: ExpressionNode;
  data: ExpressionNode;
}

export interface BinaryOpNode extends BaseNode {
  type: 'BinaryOp';
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface UnaryOpNode extends BaseNode {
  type: 'UnaryOp';
  operator: string;
  operand: ExpressionNode;
}

export interface LiteralNode extends BaseNode {
  type: 'Literal';
  value: any;
  dataType: DataType;
}

export interface IdentifierNode extends BaseNode {
  type: 'Identifier';
  name: string;
}

export interface ArrayAccessNode extends BaseNode {
  type: 'ArrayAccess';
  array: string;
  indices: ExpressionNode[];
}

export interface FunctionCallNode extends BaseNode {
  type: 'FunctionCall';
  name: string;
  arguments: ExpressionNode[];
}

// Runtime types
export interface Variable {
  type: DataType;
  value: any;
  dimensions?: Array<{ lower: number; upper: number }>;
  elementType?: DataType;
  initialized: boolean;
}

export interface ExecutionContext {
  variables: Map<string, Variable>;
  procedures: Map<string, ProcedureNode>;
  functions: Map<string, FunctionNode>;
  parent?: ExecutionContext;
}

export class RuntimeError extends Error {
  constructor(
    message: string,
    public line: number
  ) {
    super(message);
    this.name = 'RuntimeError';
  }
}

// Debug types
export type DebugAction = 'step' | 'continue' | 'stop';

export interface CallStackFrame {
  name: string;
  line: number;
  type: 'procedure' | 'function' | 'main';
}

export interface DebugState {
  currentLine: number;
  callStack: CallStackFrame[];
  variables: Map<string, Variable>;
  isPaused: boolean;
  isRunning: boolean;
}

export interface DebuggerYield {
  type: 'output' | 'pause';
  value?: string;
  debugState?: DebugState;
}
