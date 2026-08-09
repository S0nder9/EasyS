import { Symbol } from "./Symbol";

export class Scope {
  private symbols = new Map<string, Symbol>();

  constructor(public parent?: Scope) {}

  define(symbol: Symbol) {
    if (this.symbols.has(symbol.name)) {
      throw new Error(`Duplicate declaration '${symbol.name}'`);
    }

    this.symbols.set(symbol.name, symbol);
  }

  lookup(name: string): Symbol | undefined {
    const local = this.symbols.get(name);

    if (local) {
      return local;
    }

    if (this.parent) {
      return this.parent.lookup(name);
    }

    return undefined;
  }
}
