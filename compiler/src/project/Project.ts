import path from "path";

import { EasySConfig } from "../config/EasySConfig";

export class Project {
  root: string;
  config: EasySConfig;

  constructor(root: string, config: EasySConfig) {
    this.root = root;
    this.config = config;
  }

  resolve(file: string): string {
    if (path.isAbsolute(file)) {
      return file;
    }

    return path.join(this.root, file);
  }

  get entry(): string {
    return this.resolve(this.config.entry);
  }

  get output(): string {
    return this.resolve(this.config.output);
  }

  get srcDir(): string {
    return this.resolve(this.config.srcDir || "src");
  }

  get publicDir(): string {
    return this.resolve(this.config.publicDir || "public");
  }
}
