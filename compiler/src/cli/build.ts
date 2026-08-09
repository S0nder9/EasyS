import * as AST from "../ast/Nodes";
import { CssGenerator } from "../codegen/css/CssGenerator";
import { HtmlGenerator } from "../codegen/html/HtmlGenerator";
import { JsGenerator } from "../codegen/js/JsGenerator";


export class BuildGenerator {
  private htmlGenerator = new HtmlGenerator();

  private cssGenerator = new CssGenerator();

  private jsGenerator = new JsGenerator();

  generate(program: AST.ProgramNode) {
    return {
      html: this.htmlGenerator.generate(program),

      css: this.cssGenerator.generate(program.styles),

      js: this.jsGenerator.generate(program),
    };
  }
}
