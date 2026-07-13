#!/usr/bin/env node
import { runRemoveCrossesCommand } from "./commands/removeCrossesCommand.js";

runRemoveCrossesCommand(process.argv.slice(2));
