import { runBatch } from "../cliShared.js";
import { removeCrosshairsFromDxf } from "../removeCrosshairs.js";

export function runRemoveCrossesCommand(argv: string[]): void {
  let totalRemoved = 0;
  let totalHoles = 0;

  runBatch({
    argv,
    defaultSuffix: ".no-cross",
    helpText: `Usage:
  dxf-crosshair-remover remove-crosses <input.dxf|dir> [...more] [options]

Removes hole crosshair LINE entities. Keeps holes, contour and text.

Options:
  -o, --out <dir>     Output directory
  -i, --inplace       Overwrite source files
  -n, --dry-run       Only report what would be removed
  -s, --suffix <str>  Output name suffix (default: .no-cross)
  -h, --help          Show help

Examples:
  dxf-crosshair-remover remove-crosses examples/Б1-1002.dxf -o out
  dxf-crosshair-remover remove-crosses examples --dry-run
`,
    processFile(text) {
      const result = removeCrosshairsFromDxf(text);
      totalRemoved += result.removedLineCount;
      totalHoles += result.holeCount;
      return {
        output: result.output,
        summary: `holes=${result.holeCount}, removed crosshair lines=${result.removedLineCount}`,
      };
    },
    doneMessage(fileCount, dryRun) {
      return `Done: ${fileCount} file(s), ${totalHoles} hole(s), ${totalRemoved} crosshair line(s)${
        dryRun ? " (dry-run)" : " removed"
      }.`;
    },
  });
}
