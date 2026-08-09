import { test, expect } from "vitest";

import { CssGenerator } from "../src";

test("generates css", () => {
  const generator = new CssGenerator();

  const css = generator.generate([
    {
      type: "Style",

      name: "Card",

      properties: {
        padding: "20",

        radius: "12",

        background: "#fff",
      },
    },
  ]);

  expect(css).toContain("padding: 20px");

  expect(css).toContain("border-radius: 12px");
});
