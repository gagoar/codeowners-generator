#! /usr/bin/env node

import program from 'commander';
import { generateCommand } from '../commands';
import packageJSON from '../../package.json';

program
  .name(packageJSON.name)
  .version(packageJSON.version)
  .description(packageJSON.description)
  .option('--includes [glob patterns...]', 'The patterns that will return CODEOWNERS files', '**/CODEOWNERS')
  .option('--verbose', 'The amount of debugging information displayed', false)
  .option('--ci', 'Removes colors to avoid odd input', false);

program
  .command('generate')
  .description('Generates a topLevel file containing the paths of all the nested CODEOWNERS')
  .option(
    '--use-maintainers',
    'For every package.json found, generate a CODEOWNERS entry using the maintainers field',
    false
  )
  .option('--output [output file]', 'The output path and name of the file', 'CODEOWNERS')
  .action(generateCommand);

program.parse(process.argv);
