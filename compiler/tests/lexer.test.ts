import { describe, expect, it } from 'vitest';
import { Lexer } from '../src/lexer/Lexer';
import { LexerError } from '../src/lexer/LexerError';
import { TokenType } from '../src/lexer/TokenType';

describe('Lexer', () => {
  it('tokenizes a simple assignment', () => {
    const lexer = new Lexer('let answer = 42;');
    const tokens = lexer.tokenize();

    const types = tokens.map((token) => token.type);
    expect(types).toEqual([TokenType.Let, TokenType.Identifier, TokenType.Assign, TokenType.Number, TokenType.Semicolon, TokenType.EOF]);
    expect(tokens[1].value).toBe('answer');
    expect(tokens[3].value).toBe('42');
  });

  it('throws on unsupported characters', () => {
    expect(() => new Lexer('@').tokenize()).toThrow(LexerError);
  });
});
