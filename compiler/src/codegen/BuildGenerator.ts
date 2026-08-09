import * as AST from "../ast/Nodes";

import { HtmlGenerator } from "./html/HtmlGenerator";
import { CssGenerator } from "./css/CssGenerator";
import { JsGenerator } from "./js/JsGenerator";

export class BuildGenerator {
  private html = new HtmlGenerator();

  private css = new CssGenerator();

  private js = new JsGenerator();

  generate(program: AST.ProgramNode) {
    return {
      html: this.html.generate(program),

      css: this.css.generate(program.styles),

      js: this.js.generate(program),
    };
  }
}
