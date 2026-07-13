import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const distDir = path.join(root, "dist");
const binDir = path.join(root, "bin");
const bundle = path.join(distDir, "cli.cjs");
const exe = path.join(binDir, "dxf-crosshair-remover.exe");

fs.mkdirSync(binDir, { recursive: true });

if (!fs.existsSync(bundle)) {
  console.error("Missing dist/cli.cjs - run npm run build:bundle first.");
  process.exit(1);
}

const caxaBin = path.join(root, "node_modules", "caxa", "build", "index.mjs");
const args = [
  caxaBin,
  "--input",
  distDir,
  "--output",
  exe,
  "--",
  "node",
  "{{caxa}}/cli.cjs",
];

const result = spawnSync(process.execPath, args, { stdio: "inherit", cwd: root });
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(`Built ${exe} (${(fs.statSync(exe).size / 1024 / 1024).toFixed(1)} MB)`);