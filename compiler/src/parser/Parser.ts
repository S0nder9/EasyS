import { ParserError } from "./ParserError";

import * as AST from "../ast/Nodes";
import { ComponentRegistry } from "../components/ComponentRegistry";
import { ComponentExpander } from "../components/ComponentExpander";

import { Token } from "../lexer/Token";
import { TokenType } from "../lexer/TokenType";

export class Parser {
  private tokens: Token[];

  private index = 0;

  private components: AST.ComponentNode[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): AST.ProgramNode {
    const imports: AST.ImportNode[] = [];

    const styles: AST.StyleNode[] = [];

    while (!this.isEOF()) {
      this.skipNewLines();

      if (this.isEOF()) {
        break;
      }

      if (this.current().value === "import") {
        imports.push(this.parseImport());

        continue;
      }

      if (this.current().value === "style") {
        styles.push(this.parseStyle());

        continue;
      }

      if (this.current().value === "component") {
        this.components.push(this.parseComponent());

        continue;
      }

      break;
    }

    const app = this.parseApp();

    const program: AST.ProgramNode = {
      type: "Program",

      imports,

      styles,

      components: this.components,

      app,
    };

    const registry = new ComponentRegistry();

    for (const component of this.components) {
      registry.register(component);
    }

    return new ComponentExpander(registry).expandProgram(program);
  }

  private parseApp(): AST.AppNode {
    this.skipNewLines();

    this.expectKeyword("app");

    const name = this.expectIdentifier();

    this.expect(TokenType.OpenBrace);

    const pages: AST.PageNode[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      pages.push(this.parsePage());
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "App",

      name,

      pages,
    };
  }
  private parsePage(): AST.PageNode {
    this.skipNewLines();

    this.expectKeyword("page");

    const name = this.expectIdentifier();

    this.expect(TokenType.OpenBrace);

    let state: AST.StateNode | undefined;

    const body: AST.UINode[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      if (this.match("state")) {
        state = this.parseState();

        continue;
      }

      if (this.match("ui")) {
        body.push(...this.parseUI());

        continue;
      }

      throw this.error(`Unexpected token ${this.current().value}`);
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "Page",

      name,

      state,

      body,
    };
  }

  private parseUI(): AST.UINode[] {
    this.expectKeyword("ui");

    this.expect(TokenType.OpenBrace);

    const nodes: AST.UINode[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      nodes.push(this.parseElement());
    }

    this.expect(TokenType.CloseBrace);

    return nodes;
  }

  private parseElement(): AST.UINode {
    const token = this.current();

    switch (token.value) {
      case "text":
        return this.parseText();

      case "heading":
        return this.parseHeading();

      case "button":
        return this.parseButton();

      case "container":
        return this.parseContainer();

      case "section":
        return this.parseSection();

      case "image":
        // @ts-ignore
        return this.parseImage();

      case "link":
        // @ts-ignore
        return this.parseLink();

      default:
        if (
          token.type === TokenType.Identifier &&
          this.peekType() === TokenType.OpenParen
        ) {
          return this.parseComponentCall();
        }

        throw this.error(`Unexpected UI element '${token.value}'`);
    }
  }

  private parseText(): AST.TextNode {
    this.advance();

    return {
      type: "Text",

      expression: this.parseExpression(),
    };
  }

  private parseHeading(): AST.HeadingNode {
    this.advance();

    return {
      type: "Heading",

      level: 1,

      expression: this.parseExpression(),
    };
  }

  private parseButton(): AST.ButtonNode {
    this.advance();

    const text = this.expectString();

    let action: AST.ActionNode | undefined;

    if (this.check(TokenType.OpenBrace)) {
      this.expect(TokenType.OpenBrace);

      this.skipNewLines();

      if (this.current().value === "action") {
        action = this.parseAction();
      }

      this.skipNewLines();

      this.expect(TokenType.CloseBrace);
    }

    return {
      type: "Button",

      text,

      action,
    };
  }

  private parseAction(): AST.ActionNode {
    this.expectKeyword("action");

    this.expect(TokenType.OpenBrace);

    const statements: AST.Expression[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      statements.push(this.parseExpression());
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "Action",

      statements,
    };
  }

  private parseContainer(): AST.ContainerNode {
    this.advance();

    let className: string | undefined;

    if (this.match("class")) {
      className = this.expectIdentifier();
    }

    this.expect(TokenType.OpenBrace);

    const children: AST.UINode[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      children.push(this.parseElement());
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "Container",

      // @ts-ignore
      className,

      children,
    };
  }

  private parseSection(): AST.SectionNode {
    this.advance();

    this.expect(TokenType.OpenBrace);

    const children: AST.UINode[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      children.push(this.parseElement());
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "Section",

      children,
    };
  }

  private parseComponentCall(): AST.ComponentCallNode {
    const name = this.expectIdentifier();

    this.expect(TokenType.OpenParen);

    const args: AST.Expression[] = [];

    while (!this.check(TokenType.CloseParen)) {
      args.push(this.parseExpression());

      if (this.check(TokenType.Comma)) {
        this.advance();

        continue;
      }

      break;
    }

    this.expect(TokenType.CloseParen);

    return {
      type: "ComponentCall",

      name,

      arguments: args,
    };
  }
  private parseComponent(): AST.ComponentNode {
    this.expectKeyword("component");

    const name = this.expectIdentifier();

    this.expect(TokenType.OpenParen);

    const parameters: AST.ComponentParameter[] = [];

    while (!this.check(TokenType.CloseParen)) {
      parameters.push({
        name: this.expectIdentifier(),
      });

      if (this.check(TokenType.Comma)) {
        this.advance();

        continue;
      }

      break;
    }

    this.expect(TokenType.CloseParen);

    this.expect(TokenType.OpenBrace);

    const body: AST.UINode[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      body.push(this.parseElement());
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "Component",

      name,

      parameters,

      body,
    };
  }

  private parseState(): AST.StateNode {
    this.expectKeyword("state");

    this.expect(TokenType.OpenBrace);

    const variables: AST.VariableNode[] = [];

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      const name = this.expectIdentifier();

      this.expect(TokenType.Colon);

      const dataType = this.expectIdentifier();

      this.expect(TokenType.Equal);

      const value = this.parseExpression();

      variables.push({
        type: "Variable",

        name,

        dataType,

        value,
      });
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "State",

      variables,
    };
  }

  private parseExpression(): AST.Expression {
    const token = this.advance();

    if (token.type === TokenType.String) {
      return {
        type: "Literal",

        value: token.value,
      };
    }

    if (token.type === TokenType.Number) {
      return {
        type: "Literal",

        value: Number(token.value),
      };
    }

    if (token.type === TokenType.Boolean) {
      return {
        type: "Literal",

        value: token.value === "true",
      };
    }

    if (token.type === TokenType.Identifier) {
      let expression: AST.Expression = {
        type: "Identifier",

        name: token.value,
      };

      while (this.check(TokenType.Dot)) {
        this.advance();

        const property = this.expectIdentifier();

        expression = {
          // @ts-ignore
          type: "MemberExpression",

          object: expression,

          property,
        };
      }

      return expression;
    }

    throw this.error("Invalid expression");
  }

  private parseImport(): AST.ImportNode {
    this.expectKeyword("import");

    return {
      type: "Import",

      path: this.expectString(),
    };
  }

  private parseStyle(): AST.StyleNode {
    this.expectKeyword("style");

    const name = this.expectIdentifier();

    this.expect(TokenType.OpenBrace);

    const properties: any = {};

    while (!this.check(TokenType.CloseBrace)) {
      this.skipNewLines();

      if (this.check(TokenType.CloseBrace)) {
        break;
      }

      const key = this.expectIdentifier();

      this.expect(TokenType.Colon);

      const value = this.parseExpression();

      properties[key] = value;
    }

    this.expect(TokenType.CloseBrace);

    return {
      type: "Style",

      name,

      properties,
    };
  }

  private expect(type: TokenType) {
    const token = this.advance();

    if (token.type !== type) {
      throw this.error(`Expected ${TokenType[type]} but found ${token.value}`);
    }
  }

  private expectKeyword(value: string) {
    const token = this.advance();

    if (token.value !== value) {
      throw this.error(`Expected '${value}'`);
    }
  }

  private expectIdentifier(): string {
    const token = this.advance();

    if (token.type !== TokenType.Identifier) {
      throw this.error("Expected identifier");
    }

    return token.value;
  }

  private expectString(): string {
    const token = this.advance();

    if (token.type !== TokenType.String) {
      throw this.error("Expected string");
    }

    return token.value;
  }

  private match(value: string): boolean {
    if (this.current().value === value) {
      this.advance();

      return true;
    }

    return false;
  }

  private check(type: TokenType): boolean {
    return this.current().type === type;
  }

  private current(): Token {
    return this.tokens[this.index];
  }

  private peekType(): TokenType {
    return this.tokens[this.index + 1].type;
  }

  private advance(): Token {
    return this.tokens[this.index++];
  }

  private isEOF(): boolean {
    return this.current().type === TokenType.EOF;
  }

  private skipNewLines() {
    while (this.current().type === TokenType.NewLine) {
      this.advance();
    }
  }

  private error(message: string) {
    const token = this.current();

    return new ParserError(
      `${message} at App.easys:${token.line}:${token.column}`,
    );
  }
}
