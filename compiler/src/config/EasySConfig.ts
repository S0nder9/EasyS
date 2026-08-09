export interface EasySConfig {
  entry: string;
  output: string;
  srcDir?: string;
  publicDir?: string;
  appName?: string;
}

export const DEFAULT_EASYS_CONFIG: EasySConfig = {
  appName: "EasyS App",
  entry: "src/App.easys",
  output: "dist",
  srcDir: "src",
  publicDir: "public",
};
