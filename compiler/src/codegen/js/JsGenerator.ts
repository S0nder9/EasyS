import * as AST from "../../ast/Nodes";
import { RuntimeGenerator } from "./RuntimeGenerator";

export class JsGenerator {
  private runtimeGenerator = new RuntimeGenerator();

  generate(program: AST.ProgramNode): string {
    const state = this.generateState(program);

    const render = this.generateRender(program);

    const actions = this.generateActions(program);

    const runtime = this.runtimeGenerator.generate();

    return `


${state}


${render}


${actions}


${runtime}

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

    let html = "";

    for (const node of page.body) {
      html += this.node(node);
    }

    return `


window.EASY_RENDER =
(state)=>{


return \`

${html}

\`;

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
    }

    return "";
  }

  private text(node: AST.TextNode) {
    if (node.expression.type === "Identifier") {
      return `

<p>
\${state.${node.expression.name}}
</p>

`;
    }

    return `

<p>
${this.expression(node.expression)}
</p>

`;
  }

  private heading(node: AST.HeadingNode) {
    return `

<h${node.level}>

${this.expression(node.expression)}

</h${node.level}>

`;
  }

  private button(node: AST.ButtonNode) {
    const id = "action_0";

    return `

<button data-action="${id}">

${node.text}

</button>

`;
  }

  private generateActions(program: AST.ProgramNode) {
    let result = "";

    let counter = 0;

    for (const page of program.app.pages) {
      for (const node of page.body) {
        if (node.type === "Button" && node.action) {
          const id = `action_${counter++}`;

          result += `


window.EasyRuntime.actions["${id}"]
=
(state)=>{


${this.action(node.action)}

};


`;
        }
      }
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
