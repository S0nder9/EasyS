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
  fs.mkdirSync(path.join(root, "src", "pages"));
  fs.mkdirSync(path.join(root, "src", "components"));
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
  "appName": "Hello",
  "entry": "src/App.easys",
  "output": "dist",
  "srcDir": "src",
  "publicDir": "public"
}
`,
  );

  console.log(`
✓ Created EasyS project: ${name}

  ${name}/
  ─── easys.config
  ─── src/
  │   ─── App.easys
  │   ─── pages/
  │   ─── components/
  ─── public/
  ─── dist/

Run:

  cd ${name}
  easys build
  easys dev
`);
}
