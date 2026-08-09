import { test, expect } from "vitest";
import { Lexer, Parser } from "../src";

test("expands component", () => {
  const source = `

app Test {


component Card(title){


container {


heading title


}


}



page Home {


ui {


Card("Hello")


}


}


}

`;

  const ast = new Parser(new Lexer(source).tokenize()).parse();

  const page = ast.app.pages[0];

  const container = page.body[0];

  expect(container.type).toBe("Container");

  expect(container.children[0].type).toBe("Heading");
});
