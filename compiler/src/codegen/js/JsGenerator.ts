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

  private node(node: AST.UINode): string {
    switch (node.type) {
      case "Text":
        return this.text(node);

      case "Heading":
        return this.heading(node);

      case "Button":
        return this.button(node);

      case "Container":
        return `<div>${node.children.map((child) => this.node(child)).join("")}</div>`;

      case "Section":
        return `<section>${node.children.map((child) => this.node(child)).join("")}</section>`;

      default:
        return "";
    }
  }

  private text(node: AST.TextNode) {
    if (node.expression.type === "Identifier") {
      return `<p>\${state.${node.expression.name}}</p>`;
    }

    return `<p>${this.expression(node.expression)}</p>`;
  }

  private heading(node: AST.HeadingNode) {
    if (node.expression.type === "Identifier") {
      return `<h${node.level}>\${state.${node.expression.name}}</h${node.level}>`;
    }

    return `<h${node.level}>${this.expression(node.expression)}</h${node.level}>`;
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

  private expression(expr: AST.Expression): string {
    switch (expr.type) {
      case "Literal":
        return String(expr.value);

      case "Identifier":
        return `state.${expr.name}`;

      case "Binary":
        return `${this.expression(expr.left)} ${expr.operator} ${this.expression(expr.right)};`;

      default:
        return "";
    }
  }
}
