import { EasySType } from "./Type";

export interface Symbol {
  name: string;

  type: EasySType;

  properties?: Map<string, EasySType>;

  parameters?: EasySType[];
}
