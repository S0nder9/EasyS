import fs from "fs";
import path from "path";

import { ConfigParser } from "../config/ConfigParser";
import { DEFAULT_EASYS_CONFIG } from "../config/EasySConfig";
import { Project } from "./Project";

export function findProject(start = process.cwd()): Project {
  let current = start;

  while (true) {
    const configPath = path.join(current, "easys.config");

    if (fs.existsSync(configPath)) {
      return new Project(current, ConfigParser.load(configPath));
    }

    // fallback: src/App.easys without config (legacy)
    if (fs.existsSync(path.join(current, "src", "App.easys"))) {
      return new Project(current, { ...DEFAULT_EASYS_CONFIG });
    }

    const parent = path.dirname(current);

    if (parent === current) {
      break;
    }

    current = parent;
  }

  throw new Error(
    "Not an EasyS project (easys.config not found).\nRun `easys init <name>` or create easys.config in the project root.",
  );
}

export function tryFindProject(start = process.cwd()): Project | null {
  try {
    return findProject(start);
  } catch {
    return null;
  }
}
