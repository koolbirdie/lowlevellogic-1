// Debug script to see how tokens are generated
// We'll manually implement the tokenization and parsing logic to debug the FOR loop issue

// Simple token types
const TokenTypes = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  OPERATOR: 'OPERATOR',
  NEWLINE: 'NEWLINE',
  EOF: 'EOF'
};

// Keywords set
const KEYWORDS = new Set([
  'DECLARE', 'CONSTANT', 'IF', 'THEN', 'ELSE', 'ENDIF', 'WHILE', 'DO', 'ENDWHILE',
  'REPEAT', 'UNTIL', 'FOR', 'TO', 'STEP', 'NEXT', 'CASE', 'OF', 'OTHERWISE', 'ENDCASE',
  'INTEGER', 'REAL', 'STRING', 'CHAR', 'BOOLEAN', 'ARRAY',
  'INPUT', 'OUTPUT', 'PROCEDURE', 'ENDPROCEDURE', 'FUNCTION', 'ENDFUNCTION',
  'RETURN', 'RETURNS', 'CALL', 'BYVAL', 'BYREF', 'TRUE', 'FALSE',
  'AND', 'OR', 'NOT', 'DIV', 'MOD',
  'OPENFILE', 'CLOSEFILE', 'READFILE', 'WRITEFILE', 'EOF',
  'READ', 'WRITE', 'APPEND'
]);

// Simple tokenizer function
function tokenize(code) {
  const tokens = [];
  let line = 1;
  let column = 1;
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    // Skip whitespace except newlines
    if (char === ' ' || char === '\t' || char === '\r') {
      i++;
      column++;
      continue;
    }

    // Newlines
    if (char === '\n') {
      tokens.push({ type: TokenTypes.NEWLINE, value: '\n', line, column });
      i++;
      line++;
      column = 1;
      continue;
    }

    // Assignment operator =
    if (char === '=') {
      tokens.push({ type: TokenTypes.OPERATOR, value: char, line, column });
      i++;
      column++;
      continue;
    }

    // Numbers
    if (/\d/.test(char)) {
      let num = '';
      const startColumn = column;
      while (i < code.length && /[\d.]/.test(code[i])) {
        num += code[i];
        i++;
        column++;
      }
      tokens.push({ type: TokenTypes.NUMBER, value: num, line, column: startColumn });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z]/.test(char)) {
      let identifier = '';
      const startColumn = column;
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        identifier += code[i];
        i++;
        column++;
      }

      const type = KEYWORDS.has(identifier) ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
      tokens.push({ type, value: identifier, line, column: startColumn });
      continue;
    }

    // Unknown character
    throw new Error(`Unexpected character '${char}' at line ${line}, column ${column}`);
  }

  // Add EOF token
  tokens.push({ type: TokenTypes.EOF, value: '', line, column });

  return tokens;
}

// Simple parser to show the structure
function parseForLoop(tokens) {
  console.log('=== FOR LOOP PARSING ANALYSIS ===');

  let i = 0;

  function advance() {
    if (!isAtEnd()) i++;
    return tokens[i - 1];
  }

  function peek() {
    return tokens[i];
  }

  function check(type) {
    if (isAtEnd()) return false;
    return peek().type === type;
  }

  function isAtEnd() {
    return peek().type === TokenTypes.EOF;
  }

  function skipNewlines() {
    while (check(TokenTypes.NEWLINE) && !isAtEnd()) {
      advance();
    }
  }

  // Parse FOR statement
  if (check(TokenTypes.KEYWORD) && peek().value === 'FOR') {
    console.log('Found FOR keyword');
    const forToken = advance(); // consume FOR

    skipNewlines();

    if (check(TokenTypes.IDENTIFIER)) {
      const variable = advance();
      console.log(`Variable: ${variable.value}`);

      skipNewlines();

      if (check(TokenTypes.OPERATOR) && peek().value === '=') {
        advance(); // consume =
        console.log('Found assignment operator =');

        skipNewlines();

        if (check(TokenTypes.NUMBER)) {
          const start = advance();
          console.log(`Start value: ${start.value}`);

          skipNewlines();

          if (check(TokenTypes.KEYWORD) && peek().value === 'TO') {
            advance(); // consume TO
            console.log('Found TO keyword');

            skipNewlines();

            if (check(TokenTypes.NUMBER)) {
              const end = advance();
              console.log(`End value: ${end.value}`);

              skipNewlines();

              // Parse body until NEXT
              console.log('Parsing loop body...');
              let bodyStart = i;

              while (!isAtEnd()) {
                if (check(TokenTypes.KEYWORD) && peek().value === 'NEXT') {
                  break;
                }
                advance();
              }

              let bodyEnd = i;
              console.log(`Body tokens from index ${bodyStart} to ${bodyEnd}`);

              // Parse NEXT
              if (check(TokenTypes.KEYWORD) && peek().value === 'NEXT') {
                advance(); // consume NEXT
                console.log('Found NEXT keyword');

                skipNewlines();

                if (check(TokenTypes.IDENTIFIER)) {
                  const nextVar = advance();
                  console.log(`NEXT variable: ${nextVar.value}`);

                  if (nextVar.value !== variable.value) {
                    console.log(`ERROR: NEXT variable '${nextVar.value}' does not match FOR variable '${variable.value}'`);
                  } else {
                    console.log('SUCCESS: FOR and NEXT variables match');
                  }
                } else {
                  console.log('ERROR: Expected identifier after NEXT');
                }
              } else {
                console.log('ERROR: Expected NEXT to close FOR loop');
              }
            } else {
              console.log('ERROR: Expected number after TO');
            }
          } else {
            console.log('ERROR: Expected TO in FOR loop');
          }
        } else {
          console.log('ERROR: Expected number after =');
        }
      } else {
        console.log('ERROR: Expected = after FOR variable');
      }
    } else {
      console.log('ERROR: Expected identifier after FOR');
    }
  } else {
    console.log('ERROR: Expected FOR keyword');
  }
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
parseForLoop(tokens);