import { ComponentNode } from "../ast/Nodes";

export class ComponentRegistry {
  private components = new Map<string, ComponentNode>();

  register(component: ComponentNode) {
    this.components.set(component.name, component);
  }

  get(name: string) {
    return this.components.get(name);
  }

  has(name: string) {
    return this.components.has(name);
  }
}
