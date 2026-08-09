import * as AST from "../ast/Nodes";

import { Scope } from "./Scope";

import { EasySType } from "./Type";

import { SemanticError } from "./SemanticError";

export class Analyzer {
  global = new Scope();

  analyze(program: AST.ProgramNode) {
    this.registerComponents(program.components);

    this.registerStyles(program.styles);

    this.visitApp(program.app);
  }

  private visitApp(app: AST.AppNode) {
    for (const page of app.pages) {
      this.visitPage(page);
    }
  }

  private visitPage(page: AST.PageNode) {
    const scope = new Scope(this.global);

    if (page.state) {
      for (const variable of page.state.variables) {
        scope.define({
          name: variable.name,

          type: this.resolveType(variable.dataType),
        });

        this.checkExpression(variable.value, scope);
      }
    }

    for (const node of page.body) {
      this.visitNode(node, scope);
    }
  }

  private visitNode(node: AST.UINode, scope: Scope) {
    switch (node.type) {
      case "Text":
        this.checkExpression(node.expression, scope);

        break;

      case "Heading":
        this.checkExpression(node.expression, scope);

        break;

      case "Button":
        if (node.action) {
          this.visitAction(node.action, scope);
        }

        break;

      case "Container":
        for (const child of node.children) {
          this.visitNode(child, scope);
        }

        break;

      case "Section":
        for (const child of node.children) {
          this.visitNode(child, scope);
        }

        break;

      case "If":
        this.checkExpression(node.condition, scope);

        for (const child of node.thenBranch) {
          this.visitNode(child, scope);
        }

        if (node.elseBranch) {
          for (const child of node.elseBranch) {
            this.visitNode(child, scope);
          }
        }

        break;

      case "For": {
        this.checkExpression(node.iterable, scope);

        const loopScope = new Scope(scope);

        loopScope.define({
          name: node.variable,
          type: EasySType.Object,
        });

        for (const child of node.body) {
          this.visitNode(child, loopScope);
        }

        break;
      }
    }
  }

  private visitAction(action: AST.ActionNode, scope: Scope) {
    if (action.type === "Navigate") {
      return;
    }

    for (const statement of action.statements) {
      this.checkExpression(statement, scope);
    }
  }

  private checkExpression(expr: AST.Expression, scope: Scope): EasySType {
    switch (expr.type) {
      case "Literal":
        if (Array.isArray(expr.value)) return EasySType.Array;

        if (typeof expr.value === "string") return EasySType.Text;

        if (typeof expr.value === "number") return EasySType.Number;

        if (typeof expr.value === "boolean") return EasySType.Boolean;

        break;

      case "Identifier": {
        const symbol = scope.lookup(expr.name);

        if (!symbol) {
          throw new SemanticError(`Unknown variable '${expr.name}'`);
        }

        return symbol.type;
      }

      case "Member": {
        const objectType = this.checkExpression(expr.object, scope);

        return this.checkProperty(objectType, expr.property);
      }

      case "Binary": {
        const left = this.checkExpression(expr.left, scope);

        const right = this.checkExpression(expr.right, scope);

        if (left !== right) {
          throw new SemanticError(
            `Type mismatch: cannot use ${left} with ${right}`,
          );
        }

        return left;
      }
    }

    return EasySType.Unknown;
  }

  private checkProperty(type: EasySType, property: string): EasySType {
    if (type === EasySType.Object || type === EasySType.Array || type === EasySType.Unknown) {
      return EasySType.Unknown;
    }

    throw new SemanticError(
      `Property '${property}' does not exist on type '${type}'`,
    );
  }

  private resolveType(type: string) {
    if (type.endsWith("[]")) {
      return EasySType.Array;
    }

    switch (type) {
      case "string":
        return EasySType.Text;

      case "number":
        return EasySType.Number;

      case "boolean":
        return EasySType.Boolean;

      case "array":
        return EasySType.Array;

      default:
        return EasySType.Object;
    }
  }

  private registerComponents(components: AST.ComponentNode[]) {
    for (const component of components) {
      this.global.define({
        name: component.name,

        type: EasySType.Object,
      });
    }
  }

  private registerStyles(styles: AST.StyleNode[]) {
    for (const style of styles) {
      this.global.define({
        name: style.name,

        type: EasySType.Object,
      });
    }
  }
}
