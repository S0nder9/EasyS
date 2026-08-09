import { describe, test, expect } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

import { init } from "../src/cli/commands/init";
import { findProject } from "../src/project/findProject";
import { SourceResolver } from "../src/project/SourceResolver";
import { ConfigParser } from "../src/config/ConfigParser";

describe("EasyS project system", () => {
  test("init creates official project layout", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easys-"));
    const prev = process.cwd();

    try {
      process.chdir(tmp);
      init("demo");

      const root = path.join(tmp, "demo");

      expect(fs.existsSync(path.join(root, "easys.config"))).toBe(true);
      expect(fs.existsSync(path.join(root, "src", "App.easys"))).toBe(true);
      expect(fs.existsSync(path.join(root, "src", "pages"))).toBe(true);
      expect(fs.existsSync(path.join(root, "src", "components"))).toBe(true);
      expect(fs.existsSync(path.join(root, "public"))).toBe(true);

      const config = ConfigParser.load(path.join(root, "easys.config"));
      expect(config.entry).toBe("src/App.easys");
      expect(config.output).toBe("dist");
      expect(config.srcDir).toBe("src");
    } finally {
      process.chdir(prev);
    }
  });

  test("findProject walks up to easys.config", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easys-"));
    const prev = process.cwd();

    try {
      process.chdir(tmp);
      init("site");

      const nested = path.join(tmp, "site", "src", "components");
      process.chdir(nested);

      const project = findProject();
      expect(project.root).toBe(path.join(tmp, "site"));
      expect(project.entry).toContain("App.easys");
    } finally {
      process.chdir(prev);
    }
  });

  test("SourceResolver collects .easys files", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "easys-"));
    fs.mkdirSync(path.join(tmp, "src", "pages"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "src", "App.easys"), "app A {}");
    fs.writeFileSync(path.join(tmp, "src", "pages", "Home.easys"), "page Home");

    const files = SourceResolver.collect(path.join(tmp, "src"));
    expect(files.length).toBe(2);
  });
});
