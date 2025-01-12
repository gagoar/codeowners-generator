import ora from 'ora';
import { posix as path } from 'path';
import fs from 'fs';
import { sync } from 'fast-glob';
import { Command, GlobalOptions, getGlobalOptions } from '../utils/getGlobalOptions';
import {
  OUTPUT,
  INCLUDES,
  SUCCESS_SYMBOL,
  SHRUG_SYMBOL,
  PACKAGE_JSON_PATTERN,
  IGNORE_ROOT_PACKAGE_JSON_PATTERN,
} from '../utils/constants';
import { ownerRule, loadCodeOwnerFiles, loadOwnersFromPackage, generateOwnersFile } from '../utils/codeowners';
import { logger } from '../utils/debug';
import groupBy from 'lodash.groupby';
import ignore from 'ignore';
import { getPatternsFromIgnoreFiles } from '../utils/getPatternsFromIgnoreFiles';

const debug = logger('generate');
type Generate = (options: GenerateInput) => Promise<ownerRule[]>;
type GenerateInput = {
  rootDir: string;
  useMaintainers?: boolean;
  useRootMaintainers?: boolean;
  includes?: string[];
  hiddenDirectories: boolean;
};

const { basename, dirname } = path;

export const generate: Generate = async ({
  rootDir,
  includes,
  useMaintainers = false,
  useRootMaintainers = false,
  hiddenDirectories = false,
}) => {
  debug('input:', rootDir, includes, useMaintainers, useRootMaintainers);

  const includePatterns = includes && includes.length ? includes : INCLUDES;

  debug('includePatterns:', includePatterns);

  const globs = [...includePatterns];

  if (useMaintainers) {
    globs.push(...PACKAGE_JSON_PATTERN);

    if (!useRootMaintainers) {
      globs.push(...IGNORE_ROOT_PACKAGE_JSON_PATTERN);
    }
  }

  debug('provided globs:', globs);

  const matches = sync(globs, {
    dot: hiddenDirectories,
    onlyFiles: true,
  });

  debug('files found:', matches);

  const ig = ignore().add(await getPatternsFromIgnoreFiles());

  let files = matches.filter(ig.createFilter());

  debug('matches after filtering ignore patterns:', files);

  let codeOwners = [] as ownerRule[];
  if (matches.length) {
    if (useMaintainers) {
      const groups = groupBy(files, (filePath) => (basename(filePath) === 'package.json' ? 'json' : 'txt')) as Partial<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Record<'json' | 'txt', any[]>
      >;

      if (groups.json?.length) {
        const codeownersDirNames = new Set(groups.txt?.map((path: string) => dirname(path)));
        const filteredJSONs: string[] = groups.json.filter((packageJsonFile: string) => {
          if (codeownersDirNames.has(dirname(packageJsonFile))) {
            console.warn(
              `We will ignore the package.json ${packageJsonFile}, given that we have encountered a CODEOWNERS file at the same dir level`
            );
            return false;
          }
          return true;
        });

        codeOwners = [...codeOwners, ...(await loadOwnersFromPackage(rootDir, filteredJSONs))];
      }

      files = groups.txt ?? [];
    }

    if (files.length) {
      codeOwners = [...codeOwners, ...(await loadCodeOwnerFiles(rootDir, files))];
    }

    // TODO: use Intl.Collator to naturally sort the file paths. https://stackoverflow.com/questions/57257395/how-to-get-a-sorted-file-path-list-using-node-js
    return codeOwners;
  } else {
    return [];
  }
};

interface Options extends GlobalOptions {
  check?: boolean;
  hiddenDirectories?: boolean;
}

export const command = async (options: Options, command: Command): Promise<void> => {
  const globalOptions = await getGlobalOptions(command);

  const { check } = options;

  const output = options.output || globalOptions.output || OUTPUT;

  const loader = ora('generating codeowners...').start();

  const useMaintainers = globalOptions.useMaintainers || options.useMaintainers;
  const useRootMaintainers = globalOptions.useRootMaintainers || options.useRootMaintainers;
  const groupSourceComments = globalOptions.groupSourceComments || options.groupSourceComments;
  const preserveBlockPosition = globalOptions.preserveBlockPosition || options.preserveBlockPosition;
  const customRegenerationCommand = globalOptions.customRegenerationCommand || options.customRegenerationCommand;
  const { hiddenDirectories } = options;

  debug('Options:', {
    ...globalOptions,
    output,
    useMaintainers,
    useRootMaintainers,
    groupSourceComments,
    preserveBlockPosition,
    customRegenerationCommand,
    hiddenDirectories,
  });

  try {
    const ownerRules = await generate({
      rootDir: __dirname,
      useMaintainers,
      useRootMaintainers,
      hiddenDirectories,
      ...globalOptions,
    });

    if (ownerRules.length) {
      const [originalContent, newContent] = await generateOwnersFile(
        output,
        ownerRules,
        groupSourceComments,
        preserveBlockPosition,
        customRegenerationCommand
      );

      if (check) {
        if (originalContent.trimEnd() !== newContent) {
          throw new Error(
            'We found differences between the existing codeowners file and the generated rules. Remove --check option to fix this.'
          );
        }
      } else {
        fs.writeFileSync(output, newContent);
      }
      const message = check ? `up to date` : 'updated with the generated rules';
      loader.stopAndPersist({ text: `CODEOWNERS file ${message}! location: ${output}`, symbol: SUCCESS_SYMBOL });
    } else {
      const includes = globalOptions.includes?.length ? globalOptions.includes : INCLUDES;
      loader.stopAndPersist({
        text: `We couldn't find any codeowners under ${includes.join(', ')}`,
        symbol: SHRUG_SYMBOL,
      });
    }
  } catch (e) {
    const error = e as Error;
    debug(`We encountered an error: ${error.message}`);
    loader.fail(`We encountered an error: ${error.message}`);
    process.exit(1);
  }
};
