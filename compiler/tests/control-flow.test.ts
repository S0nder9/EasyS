import { describe, test, expect } from "vitest";

import { Lexer, Parser, Analyzer, HtmlGenerator } from "../src";

describe("EasyS control flow", () => {
  test("parses if else", () => {
    const source = `
app Test {
page Home "/" {
ui {
if loggedIn {
heading "Yes"
}
else {
heading "No"
}
}
}
}
`;

    const ast = new Parser(new Lexer(source).tokenize()).parse();
    const node = ast.app.pages[0].body[0];

    expect(node.type).toBe("If");
    if (node.type === "If") {
      expect(node.thenBranch.length).toBe(1);
      expect(node.elseBranch?.length).toBe(1);
    }
  });

  test("parses for", () => {
    const source = `
app Test {
page Home "/" {
ui {
for user in users {
text user.name
}
}
}
}
`;

    const ast = new Parser(new Lexer(source).tokenize()).parse();
    const node = ast.app.pages[0].body[0];

    expect(node.type).toBe("For");
    if (node.type === "For") {
      expect(node.variable).toBe("user");
    }
  });

  test("analyzes control flow with state", () => {
    const source = `
app Test {
page Home "/" {
state {
loggedIn: boolean = true
users: User[] = []
}
ui {
if loggedIn {
heading "Welcome!"
} else {
heading "Please login"
}
for user in users {
text user.name
}
}
}
}
`;

    const ast = new Parser(new Lexer(source).tokenize()).parse();
    expect(() => new Analyzer().analyze(ast)).not.toThrow();
  });

  test("generates js for if and for", () => {
    const source = `
app Test {
page Home "/" {
state {
loggedIn: boolean = true
users: User[] = []
}
ui {
if loggedIn {
heading "Welcome!"
} else {
heading "Please login"
}
for user in users {
text user.name
}
}
}
}
`;

    const ast = new Parser(new Lexer(source).tokenize()).parse();
    const output = new HtmlGenerator().generate(ast);

    expect(output.html).toContain("data-easys-if");
    expect(output.html).toContain("data-easys-for");
    expect(output.js).toContain("state.loggedIn");
    expect(output.js).toContain("state.users");
    expect(output.js).toContain(".map((user)");
  });
});
