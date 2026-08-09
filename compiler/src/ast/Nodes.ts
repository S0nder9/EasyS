import { Expression } from "./Expressions";

export type { Expression } from "./Expressions";

export interface ProgramNode {
  type: "Program";

  imports: ImportNode[];

  styles: StyleNode[];

  components: ComponentNode[];

  app: AppNode;
}

export interface AppNode {
  type: "App";

  name: string;

  pages: PageNode[];
}

export interface PageNode {
  type: "Page";

  name: string;

  state?: StateNode;

  body: UINode[];
}

export interface ComponentNode {
  type: "Component";

  name: string;

  parameters: ComponentParameter[];

  body: UINode[];
}

export interface ComponentParameter {
  type?: "ComponentParameter";

  name: string;

  dataType?: string;

  optional?: boolean;

  default?: Expression;
}

export type UINode =
  | TextNode
  | HeadingNode
  | ButtonNode
  | InputNode
  | ImageNode
  | LinkNode
  | ContainerNode
  | SectionNode
  | IfNode
  | ForNode
  | ComponentCallNode
  | arguments
  | name;

export interface TextNode {
  type: "Text";

  expression: Expression;
}

export interface name {
  type: "Name";

  name: string;
}

export interface arguments {
  type: "Arguments";

  arguments: Expression[];
}

export interface HeadingNode {
  type: "Heading";

  level: number;

  expression: Expression;
}

export interface ButtonNode {
  type: "Button";

  text: string;

  action?: ActionNode;
}

export interface InputNode {
  type: "Input";

  variable: string;
}

export interface ImageNode {
  type: "Image";

  src: string;
}

export interface LinkNode {
  type: "Link";

  text: string;

  url: string;
}

export interface ContainerNode {
  type: "Container";

  className?: string;

  children: UINode[];
}

export interface SectionNode {
  type: "Section";

  children: UINode[];
}

export interface StateNode {
  type: "State";

  variables: VariableNode[];
}

export interface VariableNode {
  type: "Variable";

  name: string;

  dataType: string;

  value: Expression;
}

export interface ActionNode {
  type: "Action";

  statements: Expression[];
}

export interface IfNode {
  type: "If";

  condition: Expression;

  thenBranch: UINode[];

  elseBranch?: UINode[];
}

export interface ForNode {
  type: "For";

  variable: string;

  iterable: Expression;

  body: UINode[];
}

export interface FunctionNode {
  type: "Function";

  name: string;

  params: string[];

  body: Expression[];
}

export interface StyleNode {
  type: "Style";

  name: string;

  properties: Record<string, any>;
}

export interface ImportNode {
  type: "Import";

  path: string;
}

export interface ComponentCallNode {
  type: "ComponentCall";

  name: string;

  arguments: Expression[];
}
