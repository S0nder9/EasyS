import { createToken, Token } from './Token';
import { TokenType } from './TokenType';
import { Keywords } from './Keywords';
import { LexerError } from './LexerError';

export class Lexer {
  private readonly input: string;
  private position = 0;
  private readPosition = 0;
  private ch = '';
  private line = 1;
  private column = 1;

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (true) {
      const token = this.nextToken();
      tokens.push(token);

      if (token.type === TokenType.EOF) {
        break;
      }
    }

    return tokens;
  }

  private nextToken(): Token {
    this.skipWhitespace();

    const line = this.line;
    const column = this.column;

    if (this.ch === '') {
      return createToken(TokenType.EOF, '', line, column);
    }

    if (this.isLetter(this.ch) || this.ch === '_') {
      return this.readIdentifier(line, column);
    }

    if (this.isDigit(this.ch)) {
      return this.readNumber(line, column);
    }

    switch (this.ch) {
      case '+':
        this.advance();
        return createToken(TokenType.Plus, '+', line, column);
      case '-':
        this.advance();
        return createToken(TokenType.Minus, '-', line, column);
      case '*':
        this.advance();
        return createToken(TokenType.Star, '*', line, column);
      case '/':
        this.advance();
        return createToken(TokenType.Slash, '/', line, column);
      case '=':
        if (this.peekChar() === '=') {
          this.advance();
          this.advance();
          return createToken(TokenType.Equal, '==', line, column);
        }
        this.advance();
        return createToken(TokenType.Assign, '=', line, column);
      case '!':
        if (this.peekChar() === '=') {
          this.advance();
          this.advance();
          return createToken(TokenType.NotEqual, '!=', line, column);
        }
        this.advance();
        return createToken(TokenType.Unknown, '!', line, column);
      case '<':
        this.advance();
        return createToken(TokenType.LessThan, '<', line, column);
      case '>':
        this.advance();
        return createToken(TokenType.GreaterThan, '>', line, column);
      case '(':
        this.advance();
        return createToken(TokenType.LeftParen, '(', line, column);
      case ')':
        this.advance();
        return createToken(TokenType.RightParen, ')', line, column);
      case ';':
        this.advance();
        return createToken(TokenType.Semicolon, ';', line, column);
      case ',':
        this.advance();
        return createToken(TokenType.Comma, ',', line, column);
      default:
        throw new LexerError(`Unexpected character: ${this.ch}`, line, column);
    }
  }

  private readIdentifier(line: number, column: number): Token {
    const start = this.position;

    while (this.isLetter(this.ch) || this.isDigit(this.ch) || this.ch === '_') {
      this.advance();
    }

    const value = this.input.slice(start, this.position);
    const type = Keywords[value] ?? TokenType.Identifier;

    return createToken(type, value, line, column);
  }

  private readNumber(line: number, column: number): Token {
    const start = this.position;

    while (this.isDigit(this.ch)) {
      this.advance();
    }

    const value = this.input.slice(start, this.position);
    return createToken(TokenType.Number, value, line, column);
  }

  private skipWhitespace(): void {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
      this.advance();
    }
  }

  private advance(): string {
    const ch = this.ch;

    if (ch === '\n') {
      this.line += 1;
      this.column = 1;
    } else if (ch !== '') {
      this.column += 1;
    }

    this.readChar();
    return ch;
  }

  private peekChar(): string {
    return this.readPosition >= this.input.length ? '' : this.input[this.readPosition];
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = '';
    } else {
      this.ch = this.input[this.readPosition];
    }

    this.position = this.readPosition;
    this.readPosition += 1;
  }
}
