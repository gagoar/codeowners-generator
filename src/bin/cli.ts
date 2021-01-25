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
  .option(
    '--group-source-comments',
    'Instead of generating one comment per rule, enabling this flag will group them, reducing comments to one per source file. Useful if your codeowners file gets too noisy',
    false
  )
  .option(
    '--custom-command',
    'Specify a custom command which will run codeowners-generator and should be printed in the generated file.'
  )
  .option('--output [output file]', 'The output path and name of the file, (default: CODEOWNERS)')
  .action(generateCommand);

program.parse(process.argv);
