import { describe, test, expect } from "vitest";
import { Lexer } from "../src/index.ts";
import { TokenType } from "../src/index.ts";

describe("EasyS Lexer", () => {
  test("tokenizes button action", () => {
    const source = `
button "Click" {

    action {

        count += 1

    }

}
`;

    const lexer = new Lexer(source, "App.easys");

    const tokens = lexer
    .tokenize()
    .filter(
        t => t.type !== TokenType.NewLine
    );

    expect(tokens[0].type).toBe(TokenType.Keyword);

    expect(tokens[0].value).toBe("button");

    expect(tokens[1].type).toBe(TokenType.String);

    expect(tokens[1].value).toBe("Click");

    expect(tokens[5].value).toBe("count");

    expect(tokens[6].type).toBe(TokenType.PlusEqual);

    expect(tokens[7].value).toBe("1");

    expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
  });
});
