import fs from "fs";
import path from "path";

import { Lexer, Parser, Analyzer, HtmlGenerator } from "../../index";
import { findProjectRoot, loadConfig, resolveEntry } from "../utils/Project";

export function build(fileArg?: string) {
  const root = findProjectRoot();
  const config = loadConfig(root);

  const file = fileArg
    ? path.isAbsolute(fileArg)
      ? fileArg
      : path.join(process.cwd(), fileArg)
    : resolveEntry(root, config);

  if (!fs.existsSync(file)) {
    console.error(`EasyS file not found: ${file}`);
    console.error("");
    console.error("Usage: easys build [file.easys]");
    process.exit(1);
  }

  console.log(`Building ${path.relative(process.cwd(), file) || file}...`);

  const source = fs.readFileSync(file, "utf-8");
  const tokens = new Lexer(source, path.basename(file)).tokenize();
  const ast = new Parser(tokens).parse();

  new Analyzer().analyze(ast);

  const output = new HtmlGenerator().generate(ast);
  const dist = path.isAbsolute(config.output)
    ? config.output
    : path.join(root, config.output);

  fs.mkdirSync(dist, { recursive: true });
  fs.mkdirSync(path.join(dist, "assets"), { recursive: true });

  fs.writeFileSync(path.join(dist, "index.html"), output.html);
  fs.writeFileSync(path.join(dist, "style.css"), output.css);
  fs.writeFileSync(path.join(dist, "app.js"), output.js);

  console.log("✓ Build complete");
  console.log(`  ${path.join(dist, "index.html")}`);
  console.log(`  ${path.join(dist, "style.css")}`);
  console.log(`  ${path.join(dist, "app.js")}`);
}
