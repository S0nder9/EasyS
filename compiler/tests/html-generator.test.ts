import { test, expect } from "vitest";

import { Lexer, Parser } from "../src";

import { HtmlGenerator } from "../src";

test("generates html", () => {
  const source = `

app Hello {


page Home {


ui {


heading "Hello World"


text "Welcome to EasyS"


button "Click me" {}


}


}


}

`;

  const ast = new Parser(new Lexer(source).tokenize()).parse();

  const output = new HtmlGenerator().generate(ast);

  expect(output.html).toContain("<h1>");

  expect(output.html).toContain("Hello World");

  expect(output.html).toContain("<button>");

  expect(output.css).toContain("body");

  expect(output.js).toContain("render()");
});

test("generates reactive counter output", () => {
  const source = `

app Counter {

page Home {

state {

count:number = 0

}

ui {

heading "Counter"

text count

button "+" {

action {

count += 1

}

}

}

}

}

`;

  const ast = new Parser(new Lexer(source).tokenize()).parse();

  const output = new HtmlGenerator().generate(ast);

  expect(output.html).toContain('data-easys-bind="count"');
  expect(output.html).toContain('onclick="easysAction0()"');
  expect(output.html).not.toContain("{{count}}");
  expect(output.js).toContain("count: 0");
  expect(output.js).toContain("state.count += 1");
  expect(output.css).toContain("body");
});
