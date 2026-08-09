import fs from "fs";
import path from "path";

export interface EasySConfig {
  entry: string;
  output: string;
}

const DEFAULT_CONFIG: EasySConfig = {
  entry: "src/App.easys",
  output: "dist",
};

export function findProjectRoot(start = process.cwd()): string {
  let dir = start;

  while (true) {
    if (fs.existsSync(path.join(dir, "easys.config"))) {
      return dir;
    }

    if (fs.existsSync(path.join(dir, "src", "App.easys"))) {
      return dir;
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      return start;
    }

    dir = parent;
  }
}

export function loadConfig(root = findProjectRoot()): EasySConfig {
  const configPath = path.join(root, "easys.config");

  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  const raw = fs.readFileSync(configPath, "utf-8");

  try {
    const parsed = JSON.parse(raw) as Partial<EasySConfig>;

    return {
      entry: parsed.entry || DEFAULT_CONFIG.entry,
      output: parsed.output || DEFAULT_CONFIG.output,
    };
  } catch {
    // allow minimal non-strict config with entry:"..." patterns
    const entryMatch = raw.match(/entry\s*:\s*"([^"]+)"/);
    const outputMatch = raw.match(/output\s*:\s*"([^"]+)"/);

    return {
      entry: entryMatch?.[1] || DEFAULT_CONFIG.entry,
      output: outputMatch?.[1] || DEFAULT_CONFIG.output,
    };
  }
}

export function resolveEntry(root = findProjectRoot(), config = loadConfig(root)): string {
  const candidates = [
    path.join(root, config.entry),
    path.join(root, "src", "App.easys"),
    path.join(root, "App.easys"),
    path.join(root, "examples", "App.easys"),
    path.join(root, "examples", "full.easys"),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return path.join(root, config.entry);
}
