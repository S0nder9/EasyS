import fs from "fs";

import { EasySConfig, DEFAULT_EASYS_CONFIG } from "./EasySConfig";

export class ConfigParser {
  static load(configPath: string): EasySConfig {
    if (!fs.existsSync(configPath)) {
      throw new Error(`easys.config not found: ${configPath}`);
    }

    const content = fs.readFileSync(configPath, "utf-8");

    try {
      const parsed = JSON.parse(content) as Partial<EasySConfig>;

      return {
        entry: parsed.entry || DEFAULT_EASYS_CONFIG.entry,
        output: parsed.output || DEFAULT_EASYS_CONFIG.output,
        srcDir: parsed.srcDir || DEFAULT_EASYS_CONFIG.srcDir,
        publicDir: parsed.publicDir || DEFAULT_EASYS_CONFIG.publicDir,
        appName: parsed.appName || DEFAULT_EASYS_CONFIG.appName,
      };
    } catch {
      const entryMatch = content.match(/"entry"\s*:\s*"([^"]+)"/);
      const outputMatch = content.match(/"output"\s*:\s*"([^"]+)"/);
      const srcMatch = content.match(/"srcDir"\s*:\s*"([^"]+)"/);
      const publicMatch = content.match(/"publicDir"\s*:\s*"([^"]+)"/);
      const nameMatch = content.match(/"appName"\s*:\s*"([^"]+)"/);

      return {
        entry: entryMatch?.[1] || DEFAULT_EASYS_CONFIG.entry,
        output: outputMatch?.[1] || DEFAULT_EASYS_CONFIG.output,
        srcDir: srcMatch?.[1] || DEFAULT_EASYS_CONFIG.srcDir,
        publicDir: publicMatch?.[1] || DEFAULT_EASYS_CONFIG.publicDir,
        appName: nameMatch?.[1] || DEFAULT_EASYS_CONFIG.appName,
      };
    }
  }
}
