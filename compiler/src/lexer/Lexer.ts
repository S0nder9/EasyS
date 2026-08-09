import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { Keywords } from "./Keywords";
import { LexerError } from "./LexerError";

export class Lexer {
  private source: string;

  private filename: string;

  private index = 0;

  private line = 1;

  private column = 1;

  constructor(source: string, filename = "unknown.easys") {
    this.source = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    this.filename = filename;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isEOF()) {
      const char = this.current();

      // spaces

      if (char === " " || char === "\t") {
        this.advance();

        continue;
      }

      // newline

      if (char === "\n") {
        tokens.push(this.makeToken(TokenType.NewLine, "\n"));

        this.advanceLine();

        continue;
      }

      // comments

      if (char === "/" && this.peek() === "/") {
        this.skipLineComment();

        continue;
      }

      if (char === "/" && this.peek() === "*") {
        this.skipBlockComment();

        continue;
      }

      // identifier / keyword

      if (this.isLetter(char)) {
        tokens.push(this.readIdentifier());

        continue;
      }

      // number

      if (this.isDigit(char)) {
        tokens.push(this.readNumber());

        continue;
      }

      // string

      if (char === '"') {
        tokens.push(this.readString());

        continue;
      }

      // operators

      const operator = this.readOperator();

      if (operator) {
        tokens.push(operator);

        continue;
      }

      throw new LexerError(
        `Unexpected character '${char}' at ${this.filename}:${this.line}:${this.column}`,
      );
    }

    tokens.push(this.makeToken(TokenType.EOF, ""));

    return tokens;
  }

  private readIdentifier(): Token {
    const start = this.position();

    let value = "";

    while (!this.isEOF() && this.isIdentifierChar(this.current())) {
      value += this.current();

      this.advance();
    }

    if (value === "true" || value === "false") {
      return {
        type: TokenType.Boolean,

        value,

        ...start,
      };
    }

    return {
      type: Keywords.has(value) ? TokenType.Keyword : TokenType.Identifier,

      value,

      ...start,
    };
  }

  private readNumber(): Token {
    const start = this.position();

    let value = "";

    let hasDot = false;

    while (!this.isEOF()) {
      const char = this.current();

      if (this.isDigit(char)) {
        value += char;

        this.advance();

        continue;
      }

      if (char === "." && !hasDot) {
        hasDot = true;

        value += char;

        this.advance();

        continue;
      }

      break;
    }

    return {
      type: TokenType.Number,

      value,

      ...start,
    };
  }

  private readString(): Token {
    const start = this.position();

    this.advance();

    let value = "";

    while (!this.isEOF() && this.current() !== '"') {
      value += this.current();

      this.advance();
    }

    if (this.isEOF()) {
      throw new LexerError(
        `Unterminated string at ${this.filename}:${this.line}:${this.column}`,
      );
    }

    this.advance();

    return {
      type: TokenType.String,

      value,

      ...start,
    };
  }

  private readOperator(): Token | null {
    const start = this.position();

    const two = this.current() + this.peek();

    const operators: Record<string, TokenType> = {
      "+=": TokenType.PlusEqual,

      "==": TokenType.EqualEqual,

      "!=": TokenType.NotEqual,

      ">=": TokenType.GreaterEqual,

      "<=": TokenType.LessEqual,

      "&&": TokenType.And,

      "||": TokenType.Or,
    };

    if (operators[two]) {
      this.advance();

      this.advance();

      return {
        type: operators[two],

        value: two,

        ...start,
      };
    }

    const one: Record<string, TokenType> = {
      "+": TokenType.Plus,

      "-": TokenType.Minus,

      "*": TokenType.Multiply,

      "/": TokenType.Divide,

      "=": TokenType.Equal,

      ">": TokenType.Greater,

      "<": TokenType.Less,

      "!": TokenType.Not,

      ":": TokenType.Colon,

      ",": TokenType.Comma,

      ".": TokenType.Dot,

      "{": TokenType.OpenBrace,

      "}": TokenType.CloseBrace,

      "(": TokenType.OpenParen,

      ")": TokenType.CloseParen,

      "[": TokenType.OpenBracket,

      "]": TokenType.CloseBracket,
    };

    const char = this.current();

    if (one[char]) {
      this.advance();

      return {
        type: one[char],

        value: char,

        ...start,
      };
    }

    return null;
  }

  private skipLineComment() {
    while (!this.isEOF() && this.current() !== "\n") {
      this.advance();
    }
  }

  private skipBlockComment() {
    this.advance();

    this.advance();

    while (!this.isEOF()) {
      if (this.current() === "*" && this.peek() === "/") {
        this.advance();

        this.advance();

        return;
      }

      this.advance();
    }

    throw new LexerError(
      `Unterminated comment at ${this.filename}:${this.line}:${this.column}`,
    );
  }

  private makeToken(type: TokenType, value: string): Token {
    return {
      type,

      value,

      ...this.position(),
    };
  }

  private position() {
    return {
      line: this.line,

      column: this.column,

      position: this.index,
    };
  }

  private current(): string {
    return this.source[this.index] ?? "";
  }

  private peek(): string {
    return this.source[this.index + 1] ?? "";
  }

  private advance() {
    this.index++;

    this.column++;
  }

  private advanceLine() {
    this.index++;

    this.line++;

    this.column = 1;
  }

  private isEOF() {
    return this.index >= this.source.length;
  }

  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  private isLetter(c: string) {
    return /[a-zA-Z_]/.test(c);
  }

  private isIdentifierChar(c: string) {
    return /[a-zA-Z0-9_]/.test(c);
  }
}
