#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

import runCommand from './sub-commands/run';
import createCommand from './sub-commands/create';
import allCommand from './sub-commands/all';
import updateReadmeCommand from './sub-commands/update-readme';

const version = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "./package.json"), { encoding: "utf-8" })).version;
const versionString = `🎄 Advent of code CLI v${version}`;

export const program = new Command()
  .version(versionString, "-v, --version")
  .description(versionString)
  .addCommand(runCommand, { isDefault: true })
  .addCommand(createCommand)
  .addCommand(allCommand)
  .addCommand(updateReadmeCommand)
  .parse(process.argv);
