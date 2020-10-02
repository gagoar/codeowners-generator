#! /usr/bin/env node

import program from 'commander';
import { generateCommand } from '../commands';
import packageJSON from '../../package.json';
import { INCLUDES } from '../utils/constants';

program
  .name(packageJSON.name)
  .version(packageJSON.version)
  .description(packageJSON.description)
  .option('--includes [glob patterns...]', `The patterns that match CODEOWNERS files, by default ${INCLUDES}`);

program
  .command('generate')
  .description('Generates a topLevel file containing the paths of all the nested CODEOWNERS')
  .option(
    '--use-maintainers',
    'For every package.json found, generate a CODEOWNERS entry using the maintainers field',
    false
  )
  .option('--output [output file]', 'The output path and name of the file, (default: CODEOWNERS)')
  .action(generateCommand);

program.parse(process.argv);
