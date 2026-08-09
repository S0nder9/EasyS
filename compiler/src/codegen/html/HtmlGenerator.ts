import * as AST from "../../ast/Nodes";

import { BuildOutput } from "../BuildOutput";

import { CssGenerator } from "../css/CssGenerator";

import { JsGenerator } from "../js/JsGenerator";

import { escapeHtml } from "./HtmlEscaper";

import { createHtmlDocument } from "./HtmlDocument";

export class HtmlGenerator {
  private actions: AST.ActionNode[] = [];

  generate(program: AST.ProgramNode): BuildOutput {
    const page = program.app.pages[0];

    const body = page.body.map((node) => this.generateNode(node)).join("\n");

    const html = createHtmlDocument(body);

    const css = new CssGenerator().generate(program.styles);

    const js = new JsGenerator().generate(program);

    return {
      html,

      css,

      js,
    };
  }

  private generateNode(node: AST.UINode): string {
    switch (node.type) {
      case "Text":
        return this.generateText(node);

      case "Heading":
        return this.generateHeading(node);

      case "Button":
        return this.generateButton(node);

      case "Container": {
        const classAttr = node.className ? ` class="${node.className}"` : "";
        return `
<div${classAttr}>
${node.children.map((child) => this.generateNode(child)).join("\n")}
</div>
`;
      }

      case "Section":
        return `
<section>
${node.children.map((child) => this.generateNode(child)).join("\n")}
</section>
`;

      case "If":
        return this.generateIf(node);

      case "For":
        return this.generateFor(node);

      case "Image":
        return this.generateImage(node);

      case "Link":
        return this.generateLink(node);

      default:
        return "";
    }
  }

  private generateText(node: AST.TextNode) {
    return `<p>${this.expressionToHtml(node.expression)}</p>`;
  }

  private generateHeading(node: AST.HeadingNode) {
    return `<h${node.level}>${this.expressionToHtml(node.expression)}</h${node.level}>`;
  }

  private generateButton(node: AST.ButtonNode) {
    let handler = "";

    if (node.action) {
      const index = this.actions.length;

      this.actions.push(node.action);

      handler = ` onclick="easysAction${index}()"`;
    }

    return `
<button${handler}>
${escapeHtml(node.text)}
</button>
`;
  }

  private generateImage(node: AST.ImageNode) {
    return `<img src="${escapeHtml(node.src)}">`;
  }

  private generateLink(node: AST.LinkNode) {
    return `<a href="${escapeHtml(node.route)}" data-easys-link="${escapeHtml(node.route)}">${escapeHtml(node.text)}</a>`;
  }

  private generateIf(node: AST.IfNode): string {
    const thenHtml = node.thenBranch
      .map((n) => this.generateNode(n))
      .join("\n");

    const elseHtml = node.elseBranch
      ? node.elseBranch.map((n) => this.generateNode(n)).join("\n")
      : "";

    return `
<div data-easys-if="${this.expressionName(node.condition)}">
${thenHtml}
</div>
${
  node.elseBranch
    ? `<div data-easys-else="${this.expressionName(node.condition)}">
${elseHtml}
</div>`
    : ""
}
`;
  }

  private generateFor(node: AST.ForNode): string {
    const bodyHtml = node.body.map((n) => this.generateNode(n)).join("\n");

    return `
<div data-easys-for="${node.variable}" data-easys-list="${this.expressionName(node.iterable)}">
${bodyHtml}
</div>
`;
  }

  private expressionName(expression: AST.Expression): string {
    if (expression.type === "Identifier") {
      return expression.name;
    }

    if (expression.type === "Member") {
      return `${this.expressionName(expression.object)}.${expression.property}`;
    }

    return "";
  }

  private expressionToHtml(expression: AST.Expression) {
    switch (expression.type) {
      case "Literal":
        return escapeHtml(String(expression.value));

      case "Identifier":
        return `
<span data-easys-bind="${expression.name}">
</span>
`;

      default:
        return "";
    }
  }
}
