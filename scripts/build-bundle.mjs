import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "dist");
const outfile = path.join(outDir, "cli.cjs");

fs.mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, "src", "main.ts")],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  outfile,
  sourcemap: true,
  legalComments: "none",
  logLevel: "info",
});

console.log(`Bundled ${outfile}`);
