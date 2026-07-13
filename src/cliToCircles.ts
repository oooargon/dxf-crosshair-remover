#!/usr/bin/env node
import { runToCirclesCommand } from "./commands/toCirclesCommand.js";

runToCirclesCommand(process.argv.slice(2));
