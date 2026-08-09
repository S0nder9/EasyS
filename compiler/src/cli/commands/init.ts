import fs from "fs";
import path from "path";

export function init(name?: string) {
  if (!name) {
    console.log("Usage: easys init <project>");
    process.exit(1);
  }

  const root = path.isAbsolute(name) ? name : path.join(process.cwd(), name);

  if (fs.existsSync(root)) {
    console.error(`Directory already exists: ${name}`);
    process.exit(1);
  }

  fs.mkdirSync(root);
  fs.mkdirSync(path.join(root, "src"));
  fs.mkdirSync(path.join(root, "public"));
  fs.mkdirSync(path.join(root, "dist"));
  fs.mkdirSync(path.join(root, "dist", "assets"));

  fs.writeFileSync(
    path.join(root, "src", "App.easys"),
    `app Hello {

  page Home "/" {

    ui {

      heading "Hello EasyS"

      text "Your first EasyS application"

    }

  }

}
`,
  );

  fs.writeFileSync(
    path.join(root, "easys.config"),
    `{
  "entry": "src/App.easys",
  "output": "dist"
}
`,
  );

  console.log(`
✓ Created EasyS project: ${name}

Run:

  cd ${name}
  easys build
  easys dev
`);
}
