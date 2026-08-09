import path from "path";
import fs from "fs";

import { build } from "./build";
import { startServer } from "../server/DevServer";
import { findProject } from "../../project/findProject";

export async function dev() {
  const project = findProject();

  build();
  startServer(project.output, 3000);

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const open = require("open");
    await open("http://localhost:3000");
  } catch {
    console.log("Open http://localhost:3000 in your browser");
  }

  const watchTarget = project.srcDir;

  console.log(`Watching ${watchTarget} ...`);

  let rebuilding = false;

  const rebuild = () => {
    if (rebuilding) return;
    rebuilding = true;

    try {
      console.log("Rebuilding...");
      build();
    } catch (error: any) {
      console.error("\u2717 Build failed:", error?.message || error);
    } finally {
      setTimeout(() => {
        rebuilding = false;
      }, 100);
    }
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const chokidar = require("chokidar");
    chokidar
      .watch(["**/*.easys"], { cwd: project.root, ignoreInitial: true })
      .on("change", rebuild);
  } catch {
    if (fs.existsSync(watchTarget)) {
      fs.watch(watchTarget, { recursive: true }, (_event, filename) => {
        if (filename && String(filename).endsWith(".easys")) {
          rebuild();
        }
      });
    }
  }
}
