import { describe, test, expect } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

import { init } from "../src/cli/commands/init";
import { loadConfig, resolveEntry } from "../src/cli/utils/Project";

describe("EasyS CLI", () => {
  test("init creates project structure", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easys-"));
    const prev = process.cwd();

    try {
      process.chdir(tmp);
      init("demo");

      expect(fs.existsSync(path.join(tmp, "demo", "src", "App.easys"))).toBe(true);
      expect(fs.existsSync(path.join(tmp, "demo", "easys.config"))).toBe(true);
      expect(fs.existsSync(path.join(tmp, "demo", "public"))).toBe(true);
      expect(fs.existsSync(path.join(tmp, "demo", "dist"))).toBe(true);

      const config = loadConfig(path.join(tmp, "demo"));
      expect(config.entry).toBe("src/App.easys");
      expect(config.output).toBe("dist");
    } finally {
      process.chdir(prev);
    }
  });

  test("resolveEntry finds App.easys", () => {
    const root = process.cwd();
    const entry = resolveEntry(root);
    expect(typeof entry).toBe("string");
  });
});
