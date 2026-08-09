import fs from "fs";
import path from "path";

import { Analyzer } from "../../index";
import { findProject } from "../../project/findProject";
import { loadProgram } from "../../project/ModuleLoader";

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

    const ast = loadProgram(entry);
    new Analyzer().analyze(ast);

    console.log("\u2713 No errors");
  } catch (error: any) {
    console.error("\u2717", error?.message || error);
    process.exit(1);
  }
}
