import path from "path";
import fs from "fs";

import { build } from "./build";
import { startServer } from "../server/DevServer";
import { findProjectRoot, loadConfig } from "../utils/Project";

export async function dev() {
  const root = findProjectRoot();
  const config = loadConfig(root);
  const dist = path.isAbsolute(config.output)
    ? config.output
    : path.join(root, config.output);

  build();
  startServer(dist, 3000);

  try {
    // optional dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const open = require("open");
    await open("http://localhost:3000");
  } catch {
    console.log("Open http://localhost:3000 in your browser");
  }

  const srcDir = path.join(root, "src");
  const watchTarget = fs.existsSync(srcDir) ? srcDir : root;

  console.log(`Watching ${watchTarget} ...`);

  let rebuilding = false;

  const rebuild = () => {
    if (rebuilding) return;
    rebuilding = true;

    try {
      console.log("Rebuilding...");
      build();
    } catch (error: any) {
      console.error("✗ Build failed:", error?.message || error);
    } finally {
      setTimeout(() => {
        rebuilding = false;
      }, 100);
    }
  };

  try {
    // prefer chokidar if installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const chokidar = require("chokidar");
    chokidar.watch(["**/*.easys"], { cwd: root, ignoreInitial: true }).on("change", rebuild);
  } catch {
    fs.watch(watchTarget, { recursive: true }, (_event, filename) => {
      if (filename && String(filename).endsWith(".easys")) {
        rebuild();
      }
    });
  }
}
