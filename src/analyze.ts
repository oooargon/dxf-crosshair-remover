#!/usr/bin/env node
import { runAnalyzeCommand } from "./commands/analyzeCommand.js";

runAnalyzeCommand(process.argv.slice(2));
