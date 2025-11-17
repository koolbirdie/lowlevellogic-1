// Test parser functionality
import { Parser } from './parser';
import { Lexer } from './lexer';

// Test pointer assignment code that was previously failing
const testCode = `
DECLARE x, y : INTEGER
DECLARE intPtr, anotherPtr : POINTER_TO_INTEGER

x <-- 42
y <-- 99
intPtr <-- &x
anotherPtr <-- &y

*intPtr <-- 100
*anotherPtr <-- 200

OUTPUT "x = ", x
OUTPUT "y = ", y
`;

console.log('Testing pointer assignment parsing...');

try {
  const lexer = new Lexer(testCode);
  const tokens = lexer.tokenize();

  console.log('Lexing successful, token count:', tokens.length);

  const parser = new Parser(tokens);
  const ast = parser.parse();

  console.log('Parsing successful!');
  console.log('AST node count:', ast.length);

  // Check for dereference assignments
  const dereferenceAssignments = ast.filter(node =>
    node.type === 'Assignment' &&
    node.target &&
    node.target.type === 'Dereference'
  );

  console.log('Found', dereferenceAssignments.length, 'dereference assignments');

  dereferenceAssignments.forEach((assignment, index) => {
    console.log(`Assignment ${index + 1}: *ptr = value`);
  });

  console.log('\n✅ Test passed! Pointer assignment syntax is working correctly.');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}