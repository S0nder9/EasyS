import fs from "fs";
import path from "path";

import { Lexer, Parser, Analyzer } from "../../index";
import { findProject } from "../../project/findProject";

export function check(fileArg?: string) {
  try {
    let entry: string;

    if (fileArg) {
      entry = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
    } else {
      entry = findProject().entry;
    }

    if (!fs.existsSync(entry)) {
      console.error(`EasyS file not found: ${entry}`);
      process.exit(1);
    }

    const source = fs.readFileSync(entry, "utf-8");
    const tokens = new Lexer(source, path.basename(entry)).tokenize();
    const ast = new Parser(tokens).parse();

    new Analyzer().analyze(ast);

    console.log("\u2713 No errors");
  } catch (error: any) {
    console.error("\u2717", error?.message || error);
    process.exit(1);
  }
}
