import { test, expect } from "vitest";

import {
    Lexer,
    Parser,
    Analyzer
} from "../src";

test("accepts valid counter", () => {
  const source = `

app Counter {

page Home "/" {

state {

count:number=0

}

ui {

text count

}

}

}

`;

  const ast = new Parser(new Lexer(source).tokenize()).parse();

  expect(() => {
    new Analyzer().analyze(ast);
  }).not.toThrow();
});

test("rejects unknown variable", () => {
  const source = `

app Test {

page Home "/" {

ui {

text hello

}

}

}

`;

  const ast = new Parser(new Lexer(source).tokenize()).parse();

  expect(() => {
    new Analyzer().analyze(ast);
  }).toThrow(/Unknown variable/);
});
