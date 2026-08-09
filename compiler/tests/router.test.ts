import { describe, test, expect } from "vitest";

import { Lexer, Parser, HtmlGenerator } from "../src";

describe("routing", () => {
  test("parses page routes", () => {
    const source = `
app Test {

page Home "/" {
ui {
heading "Home"
}
}

page About "/about" {
ui {
heading "About"
}
}

}
`;

    const ast = new Parser(new Lexer(source).tokenize()).parse();

    expect(ast.app.pages[0].route).toBe("/");
    expect(ast.app.pages[1].route).toBe("/about");
  });

  test("parses link and navigate", () => {
    const source = `
app Test {
page Home "/" {
ui {
link "About" "/about"
button "Go" {
action {
navigate "/about"
}
}
}
}
}
`;

    const ast = new Parser(new Lexer(source).tokenize()).parse();
    const body = ast.app.pages[0].body;

    expect(body[0].type).toBe("Link");
    if (body[0].type === "Link") {
      expect(body[0].route).toBe("/about");
    }

    expect(body[1].type).toBe("Button");
    if (body[1].type === "Button" && body[1].action) {
      expect(body[1].action.type).toBe("Navigate");
    }
  });

  test("generates EasyRoutes", () => {
    const source = `
app Test {
page Home "/" {
ui {
heading "Home"
link "About" "/about"
}
}
page About "/about" {
ui {
heading "About"
}
}
}
`;

    const ast = new Parser(new Lexer(source).tokenize()).parse();
    const output = new HtmlGenerator().generate(ast);

    expect(output.js).toContain("EasyRoutes");
    expect(output.js).toContain('"/about"');
    expect(output.html).toContain("data-easys-link");
    expect(output.js).toContain("data-easys-link");
  });
});
