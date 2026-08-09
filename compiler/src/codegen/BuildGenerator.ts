import * as AST from "../ast/Nodes";

import { HtmlGenerator } from "./html/HtmlGenerator";
import { CssGenerator } from "./css/CssGenerator";
import { JsGenerator } from "./js/JsGenerator";

export class BuildGenerator {
  private html = new HtmlGenerator();

  private css = new CssGenerator();

  private js = new JsGenerator();

  generate(program: AST.ProgramNode) {
    for (const component of program.components) {
        // @ts-ignore
      this.registry.register(component);
    }
// @ts-ignore
    const expanded = this.expander.expandProgram(program);

    return {
      html: this.html.generate(expanded),

      css: this.css.generate(expanded.styles),

      js: this.js.generate(expanded),
    };
  }
}
