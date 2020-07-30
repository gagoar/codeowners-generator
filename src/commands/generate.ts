import ora from 'ora';
import path, { basename } from 'path';
import { sync } from 'fast-glob';
import { Command, getGlobalOptions } from '../utils/getGlobalOptions';
import { OUTPUT, INCLUDES, SUCCESS_SYMBOL, SHRUG_SYMBOL, INCLUDES_WITH_PACKAGE_JSON } from '../utils/constants';
import { ownerRule, createOwnersFile, loadCodeOwnerFiles, loadOwnersFromPackage } from '../utils/codeowners';
import groupBy from 'lodash.groupby';

type Generate = (options: GenerateInput) => Promise<ownerRule[]>;
type GenerateInput = { rootDir: string; verifyPaths?: boolean; useMaintainers?: boolean; includes?: string[] };

export const generate: Generate = async ({ rootDir, includes, useMaintainers = false }) => {
  const globs = !includes && useMaintainers ? INCLUDES_WITH_PACKAGE_JSON : INCLUDES;
  const matches = sync(globs, {
    onlyFiles: true,
    absolute: true,
  });

  let codeOwners = [] as ownerRule[];
  let files = matches as string[];

  if (matches.length) {
    if (useMaintainers) {
      const groups = groupBy(files, (filePath) => (basename(filePath) === 'package.json' ? 'json' : 'txt')) as Partial<
        Record<'json' | 'txt', any[]>
      >;

      if (groups.json?.length) {
        codeOwners = [...codeOwners, ...(await loadOwnersFromPackage(rootDir, groups.json))];
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

interface CommandGenerate extends Command {
  output?: string;
  verifyPaths?: boolean;
  useMaintainers?: boolean;
}

export const command = async (command: CommandGenerate): Promise<void> => {
  const globalOptions = await getGlobalOptions(command);

  const { output, verifyPaths, useMaintainers } = command;

  const loader = ora('generating codeowners...').start();

  try {
    const ownerRules = await generate({ rootDir: __dirname, verifyPaths, useMaintainers, ...globalOptions });

    const outputFile = output || path.join(__dirname, OUTPUT);

    if (ownerRules.length) {
      createOwnersFile(outputFile, ownerRules);

      loader.stopAndPersist({ text: `CODEOWNERS file was created! location: ${outputFile}`, symbol: SUCCESS_SYMBOL });
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
