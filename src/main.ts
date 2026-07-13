#!/usr/bin/env node
import { runAnalyzeCommand } from "./commands/analyzeCommand.js";
import { runProcessCommand } from "./commands/processCommand.js";
import { runRemoveCrossesCommand } from "./commands/removeCrossesCommand.js";
import { runToCirclesCommand } from "./commands/toCirclesCommand.js";

const HELP = `dxf-crosshair-remover — DXF post-processing for Tekla / Advance Steel

Usage:
  dxf-crosshair-remover <command> [arguments]

Commands:
  process          Remove crosshairs and convert holes to CIRCLE (recommended)
  remove-crosses   Remove crosshair lines only
  to-circles       Convert hole polylines to CIRCLE only
  analyze          Show DXF structure summary

Run "<command> --help" for command-specific options.

Examples:
  dxf-crosshair-remover process examples -o out
  dxf-crosshair-remover analyze examples/Б1-1002.dxf
`;

type CommandRunner = (argv: string[]) => void;

const COMMANDS: Record<string, CommandRunner> = {
  process: runProcessCommand,
  "remove-crosses": runRemoveCrossesCommand,
  "to-circles": runToCirclesCommand,
  analyze: runAnalyzeCommand,
};

function main(): void {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    console.log(HELP);
    return;
  }

  const [command, ...rest] = argv;
  const run = COMMANDS[command];
  if (!run) {
    console.error(`Unknown command: ${command}\n`);
    console.log(HELP);
    process.exit(1);
  }

  run(rest);
}

main();
