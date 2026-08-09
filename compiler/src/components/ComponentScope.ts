export class ComponentScope {
  private values = new Map<string, any>();

  constructor(params: any[], args: any[]) {
    params.forEach((param, index) => {
      this.values.set(param.name, args[index]);
    });
  }

  get(name: string) {
    return this.values.get(name);
  }
}
