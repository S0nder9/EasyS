import fs from "fs";
import path from "path";

export class SourceResolver {
  static collect(dir: string): string[] {
    if (!fs.existsSync(dir)) {
      return [];
    }

    const result: string[] = [];

    for (const file of fs.readdirSync(dir)) {
      const full = path.join(dir, file);

      if (fs.statSync(full).isDirectory()) {
        result.push(...this.collect(full));
      } else if (file.endsWith(".easys")) {
        result.push(full);
      }
    }

    return result;
  }
}
