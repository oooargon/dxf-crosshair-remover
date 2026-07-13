import fs from "node:fs";
import path from "node:path";

export type CliArgs = {
  inputs: string[];
  outDir?: string;
  inplace: boolean;
  dryRun: boolean;
  suffix: string;
};

export function parseCliArgs(argv: string[], defaults: { suffix: string }): CliArgs {
  const args: CliArgs = {
    inputs: [],
    inplace: false,
    dryRun: false,
    suffix: defaults.suffix,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        throw new HelpRequested();
      case "-o":
      case "--out":
        args.outDir = argv[++i];
        break;
      case "-i":
      case "--inplace":
        args.inplace = true;
        break;
      case "-n":
      case "--dry-run":
        args.dryRun = true;
        break;
      case "-s":
      case "--suffix":
        args.suffix = argv[++i] ?? defaults.suffix;
        break;
      default:
        if (arg.startsWith("-")) {
          throw new Error(`Unknown option: ${arg}`);
        }
        args.inputs.push(arg);
        break;
    }
  }

  return args;
}

export class HelpRequested extends Error {
  constructor() {
    super("help");
    this.name = "HelpRequested";
  }
}

export function collectDxfFiles(inputPath: string): string[] {
  const stat = fs.statSync(inputPath);
  if (stat.isDirectory()) {
    return fs
      .readdirSync(inputPath)
      .filter((name) => name.toLowerCase().endsWith(".dxf"))
      .map((name) => path.join(inputPath, name))
      .sort((a, b) => a.localeCompare(b, "ru"));
  }
  return [inputPath];
}

export function resolveOutputPath(inputFile: string, args: CliArgs): string {
  if (args.inplace) return inputFile;
  const base = path.basename(inputFile, path.extname(inputFile));
  const ext = path.extname(inputFile) || ".dxf";
  if (args.outDir) {
    return path.join(args.outDir, `${base}${ext}`);
  }
  return path.join(path.dirname(inputFile), `${base}${args.suffix}${ext}`);
}

export function runBatch(options: {
  argv: string[];
  defaultSuffix: string;
  helpText: string;
  processFile: (text: string) => { output: string; summary: string };
  doneMessage: (fileCount: number, dryRun: boolean) => string;
}): void {
  let args: CliArgs;
  try {
    args = parseCliArgs(options.argv, { suffix: options.defaultSuffix });
  } catch (error) {
    if (error instanceof HelpRequested) {
      console.log(options.helpText);
      process.exit(0);
    }
    console.error(error instanceof Error ? error.message : error);
    console.log(options.helpText);
    process.exit(1);
  }

  if (args.inputs.length === 0) {
    console.log(options.helpText);
    process.exit(1);
  }

  const files = args.inputs.flatMap(collectDxfFiles);
  if (files.length === 0) {
    console.error("No DXF files found.");
    process.exit(1);
  }

  if (args.outDir && !args.dryRun) {
    fs.mkdirSync(args.outDir, { recursive: true });
  }

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const result = options.processFile(text);
    console.log(`${file}: ${result.summary}`);

    if (!args.dryRun) {
      const outPath = resolveOutputPath(file, args);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, result.output, "utf8");
      if (outPath !== file) {
        console.log(`  -> ${outPath}`);
      }
    }
  }

  console.log(`\n${options.doneMessage(files.length, args.dryRun)}`);
}
