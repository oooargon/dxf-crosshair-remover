#!/usr/bin/env node
import { runProcessCommand } from "./commands/processCommand.js";

runProcessCommand(process.argv.slice(2));
