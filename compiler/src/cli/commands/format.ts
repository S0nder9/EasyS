import fs from "fs";
import path from "path";

import { findProjectRoot, loadConfig, resolveEntry } from "../utils/Project";

export function format(fileArg?: string) {
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

  let source = fs.readFileSync(file, "utf-8");

  source = source
    .replace(/\{\s*/g, " {\n")
    .replace(/\s*\}/g, "\n}\n")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  source = source + "\n";

  fs.writeFileSync(file, source);

  console.log(`✓ Formatted ${path.relative(process.cwd(), file) || file}`);
}
