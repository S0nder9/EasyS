import { describe, test, expect } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

import { Lexer, Parser } from "../src";
import { loadProgram } from "../src/project/ModuleLoader";

describe("EasyS imports", () => {
  test("parses import path form", () => {
    const source = `
import "./components/Header.easys"

app Test {
page Home "/" {
ui {
heading "Hi"
}
}
}
`;
    const ast = new Parser(new Lexer(source).tokenize()).parse();
    expect(ast.imports[0].path).toBe("./components/Header.easys");
  });

  test("parses import Name from path", () => {
    const source = `
import Header from "./components/Header.easys"

app Test {
page Home "/" {
ui {
heading "Hi"
}
}
}
`;
    const mod = new Parser(new Lexer(source).tokenize()).parseModule("t.easys");
    expect(mod.imports[0].name).toBe("Header");
    expect(mod.imports[0].path).toBe("./components/Header.easys");
  });

  test("loads component from imported file", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easys-imp-"));
    const components = path.join(tmp, "components");
    fs.mkdirSync(components);

    fs.writeFileSync(
      path.join(components, "Card.easys"),
      `
component Card(title) {
  heading title
}
`,
    );

    fs.writeFileSync(
      path.join(tmp, "App.easys"),
      `
import "./components/Card.easys"

app Test {
page Home "/" {
ui {
Card("Hello")
}
}
}
`,
    );

    const program = loadProgram(path.join(tmp, "App.easys"));
    expect(program.components.some((c) => c.name === "Card")).toBe(true);
    expect(program.app.pages[0].body[0].type).toBe("Heading");
  });

  test("loads styles from imported file", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easys-sty-"));
    fs.writeFileSync(
      path.join(tmp, "styles.easys"),
      `
style TitleStyle {
  padding: 8
  background: "#a11e1e"
}
`,
    );

    fs.writeFileSync(
      path.join(tmp, "App.easys"),
      `
import "./styles.easys"

app Test {
page Home "/" {
ui {
container class TitleStyle {
heading "Red"
}
}
}
}
`,
    );

    const program = loadProgram(path.join(tmp, "App.easys"));
    expect(program.styles.some((s) => s.name === "TitleStyle")).toBe(true);
  });
});
