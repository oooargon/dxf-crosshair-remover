import { runBatch } from "../cliShared.js";
import { convertHolesToCirclesFromDxf } from "../convertHolesToCircles.js";
import { removeCrosshairsFromDxf } from "../removeCrosshairs.js";

export function runProcessCommand(argv: string[]): void {
  let totalRemoved = 0;
  let totalConverted = 0;

  runBatch({
    argv,
    defaultSuffix: ".ready",
    helpText: `Usage:
  dxf-crosshair-remover process <input.dxf|dir> [...more] [options]

Pipeline in one pass:
  1) remove hole crosshair LINE entities
  2) convert hole polylines to CIRCLE

Options:
  -o, --out <dir>     Output directory
  -i, --inplace       Overwrite source files
  -n, --dry-run       Only report what would change
  -s, --suffix <str>  Output name suffix (default: .ready)
  -h, --help          Show help

Examples:
  dxf-crosshair-remover process examples -o out
  dxf-crosshair-remover process examples/Б1-1002.dxf -o out
`,
    processFile(text) {
      const cleaned = removeCrosshairsFromDxf(text);
      const converted = convertHolesToCirclesFromDxf(cleaned.output);
      totalRemoved += cleaned.removedLineCount;
      totalConverted += converted.convertedCount;
      return {
        output: converted.output,
        summary: `removed crosses=${cleaned.removedLineCount}, circles=${converted.convertedCount}`,
      };
    },
    doneMessage(fileCount, dryRun) {
      return `Done: ${fileCount} file(s), removed ${totalRemoved} crosshair line(s), converted ${totalConverted} hole(s) to CIRCLE${
        dryRun ? " (dry-run)" : ""
      }.`;
    },
  });
}
