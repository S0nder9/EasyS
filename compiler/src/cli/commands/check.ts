import fs from "fs";
import path from "path";

import { Lexer, Parser, Analyzer } from "../../index";
import { findProjectRoot, loadConfig, resolveEntry } from "../utils/Project";

export function check(fileArg?: string) {
  try {
    const root = findProjectRoot();
    const config = loadConfig(root);

    const file = fileArg
      ? path.isAbsolute(fileArg)
        ? fileArg
        : path.join(process.cwd(), fileArg)
      : resolveEntry(root, config);

    if (!fs.existsSync(file)) {
      console.error(`EasyS file not found: ${file}`);
      process.exit(1);
    }

    const source = fs.readFileSync(file, "utf-8");
    const tokens = new Lexer(source, path.basename(file)).tokenize();
    const ast = new Parser(tokens).parse();

    new Analyzer().analyze(ast);

    console.log("✓ No errors");
  } catch (error: any) {
    console.error("✗", error?.message || error);
    process.exit(1);
  }
}
