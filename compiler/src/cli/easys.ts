#!/usr/bin/env node

import { init } from "./commands/init";
import { build } from "./commands/build";
import { dev } from "./commands/dev";
import { check } from "./commands/check";
import { format } from "./commands/format";

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "init":
      init(args[1]);
      break;

    case "build":
      build(args[1]);
      break;

    case "dev":
      dev();
      break;

    case "check":
      check(args[1]);
      break;

    case "format":
      format(args[1]);
      break;

    default:
      console.log(`
EasyS CLI

Commands:

  easys init <name>       Create a new project
  easys build [file]      Compile .easys to dist/
  easys dev               Build, serve, and watch
  easys check [file]      Typecheck without emit
  easys format [file]     Format .easys source

Examples:

  easys init my-site
  easys build
  easys build examples/full.easys
  easys dev
  easys check
`);
  }
}

main();
