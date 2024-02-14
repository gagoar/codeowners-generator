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
    false,
  )
  .option(
    '--use-root-maintainers',
    'It will use `maintainers` field from the package.json in the root to generate default codeowners. Works only in conjunction with `useMaintainers`',
    false,
  )
  .option(
    '--group-source-comments',
    'Instead of generating one comment per rule, enabling this flag will group them, reducing comments to one per source file. Useful if your codeowners file gets too noisy',
    false,
  )
  .option(
    '--preserve-block-position',
    'It will keep the generated block in the same position it was found in the CODEOWNERS file (if present). Useful for when you make manual additions',
    false,
  )
  .option(
    '--custom-regeneration-command',
    'Specify a custom regeneration command to be printed in the generated CODEOWNERS file, it should be mapped to run codeowners-generator',
  )
  .option('--output [output file]', 'The output path and name of the file, (default: CODEOWNERS)')
  .option(
    '--check',
    'It will fail if the CODEOWNERS generated does not match the current (or missing) CODEOWNERS. Useful for validating that the CODEOWNERS file is up to date date during CI',
  )
  .action(generateCommand);

program.parse(process.argv);
