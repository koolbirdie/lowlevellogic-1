/**
 * Lexer for IGCSE/A-LEVELS pseudocode
 * Converts source code into tokens
 */

import { Token } from './types';

const KEYWORDS = new Set([
  'DECLARE', 'CONSTANT', 'IF', 'THEN', 'ELSE', 'ENDIF', 'WHILE', 'DO', 'ENDWHILE',
  'REPEAT', 'UNTIL', 'FOR', 'TO', 'STEP', 'NEXT', 'CASE', 'OF', 'OTHERWISE', 'ENDCASE',
  'INTEGER', 'REAL', 'STRING', 'CHAR', 'BOOLEAN', 'ARRAY',
  'INPUT', 'OUTPUT', 'PROCEDURE', 'ENDPROCEDURE', 'FUNCTION', 'ENDFUNCTION',
  'RETURN', 'RETURNS', 'CALL', 'BYVAL', 'BYREF', 'TRUE', 'FALSE',
  'AND', 'OR', 'NOT', 'DIV', 'MOD',
  'OPENFILE', 'CLOSEFILE', 'READFILE', 'WRITEFILE', 'EOF',
  'READ', 'WRITE', 'APPEND',
  // Memory management keywords
  'MALLOC', 'FREE', 'SIZE_OF', 'POINTER_TO_INTEGER', 'POINTER_TO_REAL', 'POINTER_TO_CHAR', 'VOID_POINTER'
]);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
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
      tokens.push({ type: 'NEWLINE', value: '\n', line, column });
      i++;
      line++;
      column = 1;
      continue;
    }

    // Comments
    if (char === '/' && code[i + 1] === '/') {
      let comment = '';
      i += 2;
      column += 2;
      while (i < code.length && code[i] !== '\n') {
        comment += code[i];
        i++;
        column++;
      }
      tokens.push({ type: 'COMMENT', value: comment, line, column: column - comment.length });
      continue;
    }

    // String literals (double quotes)
    if (char === '"') {
      let str = '';
      const startColumn = column;
      i++;
      column++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\n') {
          throw new Error(`Unterminated string at line ${line}, column ${startColumn}`);
        }
        str += code[i];
        i++;
        column++;
      }
      if (i >= code.length) {
        throw new Error(`Unterminated string at line ${line}, column ${startColumn}`);
      }
      i++; // Skip closing quote
      column++;
      tokens.push({ type: 'STRING', value: str, line, column: startColumn });
      continue;
    }

    // Character literals (single quotes) - for CHAR type
    if (char === "'") {
      let str = '';
      const startColumn = column;
      i++;
      column++;
      while (i < code.length && code[i] !== "'") {
        if (code[i] === '\n') {
          throw new Error(`Unterminated character literal at line ${line}, column ${startColumn}`);
        }
        str += code[i];
        i++;
        column++;
      }
      if (i >= code.length) {
        throw new Error(`Unterminated character literal at line ${line}, column ${startColumn}`);
      }
      i++; // Skip closing quote
      column++;
      tokens.push({ type: 'STRING', value: str, line, column: startColumn });
      continue;
    }

    // Numbers (including hex literals)
    if (/\d/.test(char)) {
      let num = '';
      const startColumn = column;

      // Check for hex literal (0x prefix)
      if (char === '0' && code[i + 1] && code[i + 1].toLowerCase() === 'x') {
        num = '0x';
        i += 2;
        column += 2;
        while (i < code.length && /[0-9a-fA-F]/.test(code[i])) {
          num += code[i];
          i++;
          column++;
        }
        if (num.length === 2) { // Only "0x" without digits
          throw new Error(`Invalid hex literal at line ${line}, column ${startColumn}`);
        }
      } else {
        while (i < code.length && /[\d.]/.test(code[i])) {
          num += code[i];
          i++;
          column++;
        }
      }
      tokens.push({ type: 'NUMBER', value: num, line, column: startColumn });
      continue;
    }

    // Assignment operator ← or <--
    if (char === '←' || (char === '<' && code[i + 1] === '-' && code[i + 2] === '-')) {
      const startColumn = column;
      if (char === '←') {
        i++;
        column++;
      } else {
        i += 3;
        column += 3;
      }
      tokens.push({ type: 'ASSIGNMENT', value: '<--', line, column: startColumn });
      continue;
    }

    // Multi-character operators
    if (char === '<' && code[i + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '<=', line, column });
      i += 2;
      column += 2;
      continue;
    }

    if (char === '>' && code[i + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '>=', line, column });
      i += 2;
      column += 2;
      continue;
    }

    if (char === '<' && code[i + 1] === '>') {
      tokens.push({ type: 'OPERATOR', value: '<>', line, column });
      i += 2;
      column += 2;
      continue;
    }

    // Single character operators
    if ('+-*/=<>&'.includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char, line, column });
      i++;
      column++;
      continue;
    }

    // Punctuation
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: char, line, column });
      i++;
      column++;
      continue;
    }

    if (char === ':') {
      tokens.push({ type: 'COLON', value: char, line, column });
      i++;
      column++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: char, line, column });
      i++;
      column++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: char, line, column });
      i++;
      column++;
      continue;
    }

    if (char === '[') {
      tokens.push({ type: 'LBRACKET', value: char, line, column });
      i++;
      column++;
      continue;
    }

    if (char === ']') {
      tokens.push({ type: 'RBRACKET', value: char, line, column });
      i++;
      column++;
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      let identifier = '';
      const startColumn = column;
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        identifier += code[i];
        i++;
        column++;
      }

      const type = KEYWORDS.has(identifier) ? 'KEYWORD' : 'IDENTIFIER';
      tokens.push({ type, value: identifier, line, column: startColumn });
      continue;
    }

    // Unknown character
    throw new Error(`Unexpected character '${char}' at line ${line}, column ${column}`);
  }

  // Add EOF token
  tokens.push({ type: 'EOF', value: '', line, column });

  return tokens;
}
