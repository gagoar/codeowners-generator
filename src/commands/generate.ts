import { sync } from 'fast-glob';
import fs from 'fs';
import { stripIndents } from 'common-tags';
import { Command, getGlobalOptions } from '../utils/getGlobalOptions';
import { OUTPUT, INCLUDES, SUCCESS_SYMBOL, SHRUG_SYMBOL, GENERATED_FILE_LEGEND } from '../utils/constants';
import ora from 'ora';
import { promisify } from 'util';
import { join, dirname } from 'path';

type Generate = (options: GenerateInput) => Promise<ownerRule[]>;
type GenerateInput = { rootDir: string, verifyPaths?: boolean, useMaintainers?: boolean, includes?: string[] };

const readFile = promisify(fs.readFile);

type ownerRule = {
  filePath: string,
  owners: string[],
  glob: string,
};

const createMatcherCodeownersRule = (filePath: string, rule: string) => {
  const parts = rule.split(/\s+/);
  const [glob, ...owners] = parts;

  return {
    glob: join(dirname(filePath), glob),
    owners,
  };
}
const parseCodeOwner = (filePath: string, codeOwnerContent: string): ownerRule[] => {
  const content = codeOwnerContent.split('\n');

  // TODO: include comments optionally.
  const filteredRules = content.filter((line) => line && !line.startsWith('#'));

  return filteredRules.map((rule) => ({ filePath, ...createMatcherCodeownersRule(filePath, rule) }));
}

const loadCodeOwnerFiles = async (dirname: string, files: string[]): Promise<ownerRule[]> => {
  const codeOwners = await Promise.all(files.map(async (filePath) => {
    const rawContent = await readFile(filePath);

    const content = rawContent.toString();

    return parseCodeOwner(filePath.replace(`${dirname}/`, ''), content);
  }));

  return codeOwners.reduce((memo, rules) => [...memo, ...rules], []);
};

export const generate: Generate = async ({ rootDir, includes = INCLUDES }) => {

  const files = sync(includes, {
    onlyFiles: true,
    absolute: true,
  });

  if (files.length) {

    const codeOwners = await loadCodeOwnerFiles(rootDir, files);

    // TODO: use Intl.Collator to naturally sort the file paths. https://stackoverflow.com/questions/57257395/how-to-get-a-sorted-file-path-list-using-node-js
    return codeOwners;

  } else {
    return [];
  }
};

const createOwnersFile = (outputFile: string, ownerRules: ownerRule[]): void => {
  const content = ownerRules.map((rule) => stripIndents` 
    # Rule extracted from ${rule.filePath}
    ${rule.glob} ${rule.owners.join(' ')}
    `
  );

  fs.writeFileSync(outputFile, `${GENERATED_FILE_LEGEND}\n${content.join('\n')}`);
};
interface CommandGenerate extends Command {
  output?: string,
  verifyPaths?: boolean,
  useMaintainers?: boolean,
};

export const command = async (command: CommandGenerate): Promise<void> => {

  const globalOptions = await getGlobalOptions(command);

  const { output, verifyPaths, useMaintainers } = command;

  const loader = ora('generating codeowners...').start();

  try {

    const ownerRules = await generate({ rootDir: __dirname, verifyPaths, useMaintainers, ...globalOptions });

    const outputFile = output || `${__dirname} / ${OUTPUT}`;

    const includes = globalOptions.includes?.length ? globalOptions.includes : INCLUDES
    if (ownerRules.length) {

      createOwnersFile(outputFile, ownerRules);

      loader.stopAndPersist({ text: `CODEOWNERS file was created! location: ${outputFile}`, symbol: SUCCESS_SYMBOL });
    } else {
      loader.stopAndPersist({ text: `We couldn't find any codeowners under ${includes.join(', ')}`, symbol: SHRUG_SYMBOL });
    }

  } catch (e) {
    loader.fail(`We encountered an error: ${e}`);
  };

}
