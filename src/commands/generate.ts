import ora from 'ora';
import { basename, dirname } from 'path';
import { sync } from 'fast-glob';
import { Command, getGlobalOptions } from '../utils/getGlobalOptions';
import { OUTPUT, INCLUDES, SUCCESS_SYMBOL, SHRUG_SYMBOL, PACKAGE_JSON_PATTERN } from '../utils/constants';
import { ownerRule, createOwnersFile, loadCodeOwnerFiles, loadOwnersFromPackage } from '../utils/codeowners';
import { logger } from '../utils/debug';
import groupBy from 'lodash.groupby';
import ignore from 'ignore';
import { getPatternsFromIgnoreFiles } from '../utils/getPatternsFromIgnoreFiles';

const debug = logger('generate');
type Generate = (options: GenerateInput) => Promise<ownerRule[]>;
type GenerateInput = { rootDir: string; verifyPaths?: boolean; useMaintainers?: boolean; includes?: string[] };

export const generate: Generate = async ({ rootDir, includes, useMaintainers = false }) => {
  debug('input:', rootDir, includes, useMaintainers);

  const includePatterns = includes && includes.length ? includes : INCLUDES;

  debug('includePatterns:', includePatterns);

  const globs = useMaintainers ? [...includePatterns, ...PACKAGE_JSON_PATTERN] : includePatterns;

  debug('provided globs:', globs);

  const matches = sync(globs, {
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

interface Options {
  output?: string;
  verifyPaths?: boolean;
  useMaintainers?: boolean;
  groupSourceComments?: boolean;
  includes?: string[];
  customRegenerationCommand?: string;
}

export const command = async (options: Options, command: Command): Promise<void> => {
  const globalOptions = await getGlobalOptions(command);

  const { verifyPaths, useMaintainers } = options;

  const { output = globalOptions.output || OUTPUT } = options;

  const loader = ora('generating codeowners...').start();

  const groupSourceComments = globalOptions.groupSourceComments || options.groupSourceComments;

  const customRegenerationCommand = globalOptions.customRegenerationCommand || options.customRegenerationCommand;

  debug('Options:', { ...globalOptions, useMaintainers, groupSourceComments, customRegenerationCommand, output });

  try {
    const ownerRules = await generate({ rootDir: __dirname, verifyPaths, useMaintainers, ...globalOptions });

    if (ownerRules.length) {
      await createOwnersFile(output, ownerRules, customRegenerationCommand, groupSourceComments);

      loader.stopAndPersist({ text: `CODEOWNERS file was created! location: ${output}`, symbol: SUCCESS_SYMBOL });
    } else {
      const includes = globalOptions.includes?.length ? globalOptions.includes : INCLUDES;
      loader.stopAndPersist({
        text: `We couldn't find any codeowners under ${includes.join(', ')}`,
        symbol: SHRUG_SYMBOL,
      });
    }
  } catch (e) {
    loader.fail(`We encountered an error: ${e}`);
  }
};
