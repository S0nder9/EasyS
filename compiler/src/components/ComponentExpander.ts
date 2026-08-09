import { ComponentRegistry } from "./ComponentRegistry";

import * as AST from "../ast/Nodes";

export class ComponentExpander {
  constructor(private registry: ComponentRegistry) {}

  expand(node: AST.UINode): AST.UINode[] {
    if (node.type === "ComponentCall") {
      const componentCall = node as AST.ComponentCallNode;
      const component = this.registry.get(componentCall.name);

      if (!component) {
        throw new Error(`Unknown component '${componentCall.name}'`);
      }

      return this.replaceParameters(
        component.body,
        component.parameters,
        componentCall.arguments,
      ).flatMap((child) => this.expand(child));
    }

    return [node];
  }

  expandProgram(program: AST.ProgramNode): AST.ProgramNode {
    return {
      ...program,

      app: {
        ...program.app,

        pages: program.app.pages.map((page) => ({
          ...page,

          body: page.body.flatMap((node) => this.expandNode(node)),
        })),
      },
    };
  }

  private replaceParameters(
    nodes: AST.UINode[],
    params: any[],
    args: AST.Expression[],
  ) {
    return nodes.map((node) => this.replaceNode(node, params, args));
  }

  private replaceNode(node: any, params: any[], args: any[]) {
    if (node.type === "Text") {
      return {
        ...node,

        expression: this.replaceExpression(node.expression, params, args),
      };
    }

    if (node.type === "Heading") {
      return {
        ...node,

        expression: this.replaceExpression(node.expression, params, args),
      };
    }

    if (node.type === "Container" || node.type === "Section") {
      return {
        ...node,

        children: (node.children || []).map((child: any) =>
          this.replaceNode(child, params, args),
        ),
      };
    }

    return node;
  }

  private expandNode(node: AST.UINode): AST.UINode[] {
    if (node.type === "ComponentCall") {
      return this.expand(node);
    }

    if (node.type === "Container" || node.type === "Section") {
      return [
        {
          ...node,

          children: node.children.flatMap((child) => this.expandNode(child)),
        },
      ];
    }

    return [node];
  }

  private replaceExpression(expr: any, params: any[], args: any[]) {
    if (expr.type === "Identifier") {
      const index = params.findIndex((p) => p.name === expr.name);

      if (index !== -1) {
        return args[index];
      }
    }

    return expr;
  }
}
