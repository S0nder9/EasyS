import * as AST from "../../ast/Nodes";

import { CssPropertyMap } from "./CssProperties";

export class CssGenerator {
  generate(styles: AST.StyleNode[]): string {
    const base = `

body {

margin:0;

font-family:Arial, sans-serif;

}

`;

    return base + styles.map((style) => this.generateStyle(style)).join("\n\n");
  }

  private generateStyle(style: AST.StyleNode) {
    const className = `.${style.name}`;

    const properties = Object.entries(style.properties)
      .map(([key, value]) => this.generateProperty(key, value))
      .filter(Boolean)
      .join("\n");

    return `
${className} {

${properties}

}
`;
  }

  private generateProperty(key: string, value: string) {
    const css = CssPropertyMap[key];

    if (!css) {
      return "";
    }

    let finalValue = value;

    if (this.needsPx(key, value)) {
      finalValue += "px";
    }

    return `${css}: ${finalValue};`;
  }

  private needsPx(key: string, value: string) {
    const noPx = ["background", "color", "border", "display", "flex", "align"];

    if (noPx.includes(key)) {
      return false;
    }

    return !value.includes("px");
  }
}
