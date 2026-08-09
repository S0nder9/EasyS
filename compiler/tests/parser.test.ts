import { describe, test, expect } from "vitest";
import { Lexer, Parser } from "../src/index.ts";

describe("EasyS Parser", () => {
  test("parses app", () => {
  const source = `

app Test {

page Home "/" {

ui {

heading "Hello"

}

}

}

`;

  const tokens = new Lexer(source).tokenize();

  const ast = new Parser(tokens).parse();

  expect(ast.app.name).toBe("Test");

  expect(ast.app.pages[0].name).toBe("Home");
  expect(ast.app.pages[0].route).toBe("/");
  });
});
