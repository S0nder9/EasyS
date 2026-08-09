import * as AST from "../../ast/Nodes";
import { RuntimeGenerator } from "./RuntimeGenerator";

export class JsGenerator {
  private runtimeGenerator = new RuntimeGenerator();
  private actionCounter = 0;

  generate(program: AST.ProgramNode): string {
    this.actionCounter = 0;

    const runtime = this.runtimeGenerator.generate();
    const state = this.generateState(program);
    const render = this.generateRender(program);

    this.actionCounter = 0;
    const actions = this.generateActions(program);
    const bridges = this.generateActionBridges(program);

    return `
${runtime}

${state}

${render}

${actions}

${bridges}

window.EasyRuntime.mount();
`;
  }

  private generateState(program: AST.ProgramNode) {
    const page = program.app.pages[0];

    let result = "window.EasyRuntime.state={";

    if (page.state) {
      for (const variable of page.state.variables) {
        result += `\n${variable.name}: ${this.expression(variable.value)},`;
      }
    }

    result += "\n};\n";

    return result;
  }

  private generateRender(program: AST.ProgramNode) {
    const page = program.app.pages[0];

    this.actionCounter = 0;

    let html = "";

    for (const node of page.body) {
      html += this.node(node);
    }

    return `
window.EASY_RENDER = (state)=>{
return \`${html}\`;
};
`;
  }

  private node(node: AST.UINode, loopVars: Set<string> = new Set()): string {
    switch (node.type) {
      case "Text":
        return this.text(node, loopVars);

      case "Heading":
        return this.heading(node, loopVars);

      case "Button":
        return this.button(node);

      case "Container": {
        const classAttr = node.className ? ` class=\"${node.className}\"` : "";
        return `<div${classAttr}>${node.children.map((child) => this.node(child, loopVars)).join("")}</div>`;
      }

      case "Section":
        return `<section>${node.children.map((child) => this.node(child, loopVars)).join("")}</section>`;

      case "If":
        return this.ifNode(node, loopVars);

      case "For":
        return this.forNode(node, loopVars);

      default:
        return "";
    }
  }

  private ifNode(node: AST.IfNode, loopVars: Set<string>): string {
    const condition = this.expression(node.condition, loopVars);
    const thenHtml = node.thenBranch
      .map((child) => this.node(child, loopVars))
      .join("");
    const elseHtml = (node.elseBranch || [])
      .map((child) => this.node(child, loopVars))
      .join("");

    return `\${${condition} ? \`${thenHtml}\` : \`${elseHtml}\`}`;
  }

  private forNode(node: AST.ForNode, loopVars: Set<string>): string {
    const iterable = this.expression(node.iterable, loopVars);
    const nextVars = new Set(loopVars);
    nextVars.add(node.variable);

    const bodyHtml = node.body
      .map((child) => this.node(child, nextVars))
      .join("");

    return `\${(${iterable} || []).map((${node.variable}) => \`${bodyHtml}\`).join("")}`;
  }

  private text(node: AST.TextNode, loopVars: Set<string>) {
    if (node.expression.type === "Identifier" || node.expression.type === "Member") {
      const value = this.expression(node.expression, loopVars);
      return `<p>\${${value}}</p>`;
    }

    if (node.expression.type === "Literal") {
      return `<p>${String(node.expression.value)}</p>`;
    }

    return `<p></p>`;
  }

  private heading(node: AST.HeadingNode, loopVars: Set<string>) {
    if (node.expression.type === "Identifier" || node.expression.type === "Member") {
      const value = this.expression(node.expression, loopVars);
      return `<h${node.level}>\${${value}}</h${node.level}>`;
    }

    if (node.expression.type === "Literal") {
      return `<h${node.level}>${String(node.expression.value)}</h${node.level}>`;
    }

    return `<h${node.level}></h${node.level}>`;
  }

  private button(node: AST.ButtonNode) {
    const id = `action_${this.actionCounter++}`;

    return `<button data-action="${id}">${node.text}</button>`;
  }

  private generateActions(program: AST.ProgramNode) {
    let result = "";

    this.actionCounter = 0;

    for (const page of program.app.pages) {
      result += this.collectActions(page.body);
    }

    return result;
  }

  private collectActions(nodes: AST.UINode[]): string {
    let result = "";

    for (const node of nodes) {
      if (node.type === "Button" && node.action) {
        const id = `action_${this.actionCounter++}`;

        result += `
window.EasyRuntime.actions["${id}"] = (state)=>{
${this.action(node.action)}
};
`;
      }

      if (node.type === "Container" || node.type === "Section") {
        result += this.collectActions(node.children);
      }

      if (node.type === "If") {
        result += this.collectActions(node.thenBranch);
        if (node.elseBranch) {
          result += this.collectActions(node.elseBranch);
        }
      }

      if (node.type === "For") {
        result += this.collectActions(node.body);
      }
    }

    return result;
  }

  private generateActionBridges(program: AST.ProgramNode) {
    let result = "";
    let index = 0;

    const walk = (nodes: AST.UINode[]) => {
      for (const node of nodes) {
        if (node.type === "Button" && node.action) {
          const actionId = `action_${index}`;
          result += `
function easysAction${index}(){
if(window.EasyRuntime && window.EasyRuntime.actions["${actionId}"]){
window.EasyRuntime.actions["${actionId}"](window.EasyRuntime.state);
window.EasyRuntime.render();
}
}
`;
          index++;
        }

        if (node.type === "Container" || node.type === "Section") {
          walk(node.children);
        }

        if (node.type === "If") {
          walk(node.thenBranch);
          if (node.elseBranch) {
            walk(node.elseBranch);
          }
        }

        if (node.type === "For") {
          walk(node.body);
        }
      }
    };

    for (const page of program.app.pages) {
      walk(page.body);
    }

    return result;
  }

  private action(action: AST.ActionNode) {
    let result = "";

    for (const expr of action.statements) {
      if (expr.type === "Binary") {
        result += this.expression(expr);
      }
    }

    return result;
  }

  private expression(
    expr: AST.Expression,
    loopVars: Set<string> = new Set(),
  ): string {
    switch (expr.type) {
      case "Literal":
        if (Array.isArray(expr.value)) {
          return JSON.stringify(expr.value);
        }
        if (typeof expr.value === "string") {
          return JSON.stringify(expr.value);
        }
        return String(expr.value);

      case "Identifier":
        if (loopVars.has(expr.name)) {
          return expr.name;
        }
        return `state.${expr.name}`;

      case "Member":
        return `${this.expression(expr.object, loopVars)}.${expr.property}`;

      case "Binary":
        return `${this.expression(expr.left, loopVars)} ${expr.operator} ${this.expression(expr.right, loopVars)};`;

      default:
        return "";
    }
  }
}
