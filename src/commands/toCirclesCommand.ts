import { runBatch } from "../cliShared.js";
import { convertHolesToCirclesFromDxf } from "../convertHolesToCircles.js";

export function runToCirclesCommand(argv: string[]): void {
  let totalConverted = 0;

  runBatch({
    argv,
    defaultSuffix: ".circles",
    helpText: `Usage:
  dxf-crosshair-remover to-circles <input.dxf|dir> [...more] [options]

Converts circular hole polylines (2 verts, bulge ±1) into CIRCLE entities.

Options:
  -o, --out <dir>     Output directory
  -i, --inplace       Overwrite source files
  -n, --dry-run       Only report what would be converted
  -s, --suffix <str>  Output name suffix (default: .circles)
  -h, --help          Show help

Examples:
  dxf-crosshair-remover to-circles examples/Б1-1002.dxf -o out
  dxf-crosshair-remover to-circles out --inplace
`,
    processFile(text) {
      const result = convertHolesToCirclesFromDxf(text);
      totalConverted += result.convertedCount;
      return {
        output: result.output,
        summary: `converted holes to CIRCLE=${result.convertedCount}`,
      };
    },
    doneMessage(fileCount, dryRun) {
      return `Done: ${fileCount} file(s), ${totalConverted} hole(s)${
        dryRun ? " would be converted" : " converted to CIRCLE"
      }.`;
    },
  });
}
