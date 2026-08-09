import fs from "fs";
import path from "path";

import { findProject } from "../../project/findProject";
import { SourceResolver } from "../../project/SourceResolver";

export function format(fileArg?: string) {
  let files: string[] = [];

  if (fileArg) {
    const file = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);

    if (!fs.existsSync(file)) {
      console.error(`EasyS file not found: ${file}`);
      process.exit(1);
    }

    files = [file];
  } else {
    const project = findProject();
    files = SourceResolver.collect(project.srcDir);

    if (files.length === 0 && fs.existsSync(project.entry)) {
      files = [project.entry];
    }
  }

  if (files.length === 0) {
    console.error("No .easys files found");
    process.exit(1);
  }

  for (const file of files) {
    let source = fs.readFileSync(file, "utf-8");

    source = source
      .replace(/\{\s*/g, " {\n")
      .replace(/\s*\}/g, "\n}\n")
      .replace(/\n\s*\n\s*\n+/g, "\n\n")
      .trim();

    source = source + "\n";

    fs.writeFileSync(file, source);
    console.log(`\u2713 Formatted ${path.relative(process.cwd(), file) || file}`);
  }
}
