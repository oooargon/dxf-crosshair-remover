import fs from "node:fs";
import path from "node:path";
import { summarizeDxf } from "../removeCrosshairs.js";

export function runAnalyzeCommand(argv: string[]): void {
  if (argv.includes("-h") || argv.includes("--help")) {
    console.log(`Usage:
  dxf-crosshair-remover analyze <input.dxf|dir> [options]

Options:
  -h, --help  Show help

Examples:
  dxf-crosshair-remover analyze examples/Б1-1002.dxf
  dxf-crosshair-remover analyze out
`);
    return;
  }

  const input = argv.find((a) => !a.startsWith("-")) ?? "examples";
  const stat = fs.statSync(input);
  const files = stat.isDirectory()
    ? fs
        .readdirSync(input)
        .filter((n) => n.toLowerCase().endsWith(".dxf"))
        .map((n) => path.join(input, n))
    : [input];

  if (files.length === 0) {
    console.error("No DXF files found.");
    process.exit(1);
  }

  for (const file of files.sort((a, b) => a.localeCompare(b, "ru"))) {
    const summary = summarizeDxf(fs.readFileSync(file, "utf8"));
    console.log(`\n=== ${file} ===`);
    console.log("entities:", summary.entityCounts);
    console.log("by layer:", summary.layerCounts);
    console.log(
      `holes: ${summary.holes.length}, crosshair lines: ${summary.crosshairLines}`,
    );
    for (const hole of summary.holes) {
      console.log(
        `  hole @ (${hole.center.x}, ${hole.center.y}) d=${hole.diameter} layer=${hole.layer} (${hole.source})`,
      );
    }
  }
}
