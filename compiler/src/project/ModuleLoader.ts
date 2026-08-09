import fs from "fs";
import path from "path";

import * as AST from "../ast/Nodes";
import { Lexer } from "../lexer/Lexer";
import { Parser } from "../parser/Parser";

export class ModuleLoader {
  private cache = new Map<string, AST.ModuleNode>();
  private loading = new Set<string>();

  loadEntry(entryPath: string): AST.ProgramNode {
    const absolute = path.resolve(entryPath);
    const module = this.loadModule(absolute);

    if (!module.app) {
      throw new Error(`Entry file must declare an app: ${entryPath}`);
    }

    const styles: AST.StyleNode[] = [];
    const components: AST.ComponentNode[] = [];
    const imports: AST.ImportNode[] = [];

    this.collect(absolute, styles, components, imports, new Set());

    const program: AST.ProgramNode = {
      type: "Program",
      imports,
      styles,
      components,
      app: module.app,
    };

    return new Parser([]).expandProgram(program);
  }

  private collect(
    filePath: string,
    styles: AST.StyleNode[],
    components: AST.ComponentNode[],
    imports: AST.ImportNode[],
    visited: Set<string>,
  ) {
    const absolute = path.resolve(filePath);

    if (visited.has(absolute)) {
      return;
    }

    visited.add(absolute);

    const module = this.loadModule(absolute);

    for (const imp of module.imports) {
      imports.push(imp);
      const resolved = this.resolveImportPath(absolute, imp.path);
      this.collect(resolved, styles, components, imports, visited);
    }

    styles.push(...module.styles);
    components.push(...module.components);
  }

  private loadModule(absolute: string): AST.ModuleNode {
    if (this.cache.has(absolute)) {
      return this.cache.get(absolute)!;
    }

    if (this.loading.has(absolute)) {
      throw new Error(`Circular import detected: ${absolute}`);
    }

    if (!fs.existsSync(absolute)) {
      throw new Error(`Imported file not found: ${absolute}`);
    }

    this.loading.add(absolute);

    try {
      const source = fs.readFileSync(absolute, "utf-8");
      const tokens = new Lexer(source, path.basename(absolute)).tokenize();
      const module = new Parser(tokens).parseModule(absolute);
      this.cache.set(absolute, module);
      return module;
    } finally {
      this.loading.delete(absolute);
    }
  }

  private resolveImportPath(fromFile: string, importPath: string): string {
    const dir = path.dirname(fromFile);
    let resolved = path.resolve(dir, importPath);

    if (!resolved.endsWith(".easys") && fs.existsSync(resolved + ".easys")) {
      resolved = resolved + ".easys";
    }

    return resolved;
  }
}

export function loadProgram(entryPath: string): AST.ProgramNode {
  return new ModuleLoader().loadEntry(entryPath);
}
