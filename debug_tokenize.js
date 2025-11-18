// Debug script to see how tokens are generated
// Since the source files are TypeScript, we need to transpile them first
// Let's use ts-node to run TypeScript directly

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  // Try to use ts-node if available
  const tsNode = require('ts-node');
  if (tsNode) {
    tsNode.register();
  }
} catch (e) {
  console.log('ts-node not available, attempting to load compiled JS files...');
}

// Try to import from TypeScript files (with ts-node) or compiled JS files
let tokenize, parse;

try {
  // Try importing from TypeScript files
  const lexerModule = await import('./src/interpreter/lexer.ts');
  const parserModule = await import('./src/interpreter/parser.ts');
  tokenize = lexerModule.tokenize;
  parse = parserModule.parse;
} catch (e) {
  console.log('Failed to import TypeScript files:', e.message);
  console.log('You may need to run: npm install -g ts-node');
  console.log('Or compile the TypeScript files first: npm run build');
  process.exit(1);
}

const testCode = `FOR i = 1 TO 5
    OUTPUT i
NEXT i`;

console.log('Testing FOR loop with NEXT:');
console.log('Code:');
console.log(testCode);
console.log('');

console.log('=== TOKENIZATION ===');
const tokens = tokenize(testCode);

tokens.forEach((token, index) => {
  console.log(`${index}: Type="${token.type}", Value="${token.value}", Line=${token.line}, Column=${token.column}`);
});

console.log('');
console.log('=== PARSING ===');
try {
  const ast = parse(tokens);
  console.log('Parse successful!');
  console.log('AST:');
  console.log(JSON.stringify(ast, null, 2));
} catch (error) {
  console.log('Parse failed:', error.message);
}