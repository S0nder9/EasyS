import fs from "fs";
import path from "path";

import { Analyzer, HtmlGenerator } from "../../index";
import { findProject, tryFindProject } from "../../project/findProject";
import { SourceResolver } from "../../project/SourceResolver";
import { loadProgram } from "../../project/ModuleLoader";

export function build(fileArg?: string) {
  let entry: string;
  let outputDir: string;
  let root: string;

  if (fileArg) {
    entry = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);

    if (!fs.existsSync(entry)) {
      console.error(`EasyS file not found: ${fileArg}`);
      console.error("");
      console.error("Usage: easys build [file.easys]");
      process.exit(1);
    }

    const project = tryFindProject(path.dirname(entry));
    root = project?.root || process.cwd();
    outputDir = project ? project.output : path.join(process.cwd(), "dist");
  } else {
    const project = findProject();
    entry = project.entry;
    outputDir = project.output;
    root = project.root;

    if (!fs.existsSync(entry)) {
      console.error(`Entry file not found: ${entry}`);
      console.error('Check easys.config "entry" field.');
      process.exit(1);
    }
  }

  console.log(`Building ${path.relative(process.cwd(), entry) || entry}...`);

  const srcDir = path.join(root, "src");
  const sources = SourceResolver.collect(srcDir);

  if (sources.length > 1) {
    console.log(`  found ${sources.length} .easys files under src/`);
  }

  const ast = loadProgram(entry);

  new Analyzer().analyze(ast);

  const output = new HtmlGenerator().generate(ast);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, "assets"), { recursive: true });

  const publicDir = path.join(root, "public");

  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, path.join(outputDir, "assets"));
  }

  fs.writeFileSync(path.join(outputDir, "index.html"), output.html);
  fs.writeFileSync(path.join(outputDir, "style.css"), output.css);
  fs.writeFileSync(path.join(outputDir, "app.js"), output.js);

  console.log("\u2713 Build complete");
  console.log(`  ${path.join(outputDir, "index.html")}`);
  console.log(`  ${path.join(outputDir, "style.css")}`);
  console.log(`  ${path.join(outputDir, "app.js")}`);
}

function copyDir(from: string, to: string) {
  if (!fs.existsSync(from)) return;

  fs.mkdirSync(to, { recursive: true });

  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    const dest = path.join(to, name);

    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}
