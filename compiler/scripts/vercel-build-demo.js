/**
 * Builds the EasyS compiler, then compiles examples/easys-demo.
 * Vercel Root Directory: compiler/examples/easys-demo
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const compilerRoot = path.resolve(__dirname, "..");
const demoRoot = path.join(compilerRoot, "examples", "easys-demo");
const entry = path.join(demoRoot, "src", "App.easys");

function run(cmd, cwd, { allowFail = false } = {}) {
  console.log(`> ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: "inherit", env: process.env });
  } catch (e) {
    if (!allowFail) throw e;
    console.warn("Command finished with non-zero status (continuing)");
  }
}

if (!fs.existsSync(path.join(compilerRoot, "node_modules", "typescript"))) {
  run("npm install --no-audit --no-fund", compilerRoot);
}

const tsc = path.join(compilerRoot, "node_modules", "typescript", "lib", "tsc.js");
// tsc may report type errors from incomplete @types but still emit JS
run(`node "${tsc}" -p tsconfig.build.json --pretty false`, compilerRoot, {
  allowFail: true,
});

const easysCli = path.join(compilerRoot, "dist", "cli", "easys.js");
if (!fs.existsSync(easysCli)) {
  console.error("EasyS CLI missing after compile:", easysCli);
  process.exit(1);
}

run(`node "${easysCli}" build "${entry}"`, compilerRoot);

const index = path.join(demoRoot, "dist", "index.html");
if (!fs.existsSync(index)) {
  console.error("Missing output:", index);
  process.exit(1);
}

console.log("✓ Demo built →", path.relative(compilerRoot, path.join(demoRoot, "dist")));
