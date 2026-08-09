#!/usr/bin/env node

import fs from "fs";
import path from "path";

import { Lexer, Parser, Analyzer, HtmlGenerator } from "../index";

function resolveInputFile(): string {
  const arg = process.argv[3];

  if (arg) {
    return arg;
  }

  for (const candidate of ["App.easys", "examples/App.easys"]) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "App.easys";
}

function build() {
  const file = resolveInputFile();

  if (!fs.existsSync(file)) {
    console.error(`EasyS file not found: ${file}`);
    console.error("");
    console.error("Usage: easys build <file.easys>");
    console.error("Example: easys build examples/App.easys");

    process.exit(1);
  }

  console.log(`Building ${file}...`);

  const source = fs.readFileSync(file, "utf-8");

  const tokens = new Lexer(source, file).tokenize();

  const ast = new Parser(tokens).parse();

  new Analyzer().analyze(ast);

  const output = new HtmlGenerator().generate(ast);

  const dist = path.join(process.cwd(), "dist");

  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  fs.writeFileSync(path.join(dist, "index.html"), output.html);
  fs.writeFileSync(path.join(dist, "style.css"), output.css);
  fs.writeFileSync(path.join(dist, "app.js"), output.js);

  console.log("✓ Build complete");

  console.log("dist/index.html created");
  console.log("dist/style.css created");
  console.log("dist/app.js created");
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case "build":
      build();

      break;

    default:
      console.log(`
EasyS CLI

Commands:

  easys build [file.easys]

Examples:

  easys build examples/App.easys
  easys build App.easys

`);
  }
}

main();
