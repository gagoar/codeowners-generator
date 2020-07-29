import fs from 'fs';
import { stripIndents } from 'common-tags';
import { GENERATED_FILE_LEGEND } from './constants';
import isValidGlob from 'is-valid-glob';
import { dirname, join } from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
export type ownerRule = {
  filePath: string;
  owners: string[];
  glob: string;
};
export const createOwnersFile = (outputFile: string, ownerRules: ownerRule[]): void => {
  const content = ownerRules.map(
    (rule) => stripIndents` 
    # Rule extracted from ${rule.filePath}
    ${rule.glob} ${rule.owners.join(' ')}
    `
  );

  fs.writeFileSync(outputFile, [GENERATED_FILE_LEGEND, ...content].join('\n'));
};

const parseCodeOwner = (filePath: string, codeOwnerContent: string): ownerRule[] => {
  const content = codeOwnerContent.split('\n');

  // TODO: include comments optionally.
  const filteredRules = content.filter((line) => line && !line.startsWith('#'));

  return filteredRules.map((rule) => ({ filePath, ...createMatcherCodeownersRule(filePath, rule) }));
};

const createMatcherCodeownersRule = (filePath: string, rule: string) => {
  const parts = rule.split(/\s+/);
  const [glob, ...owners] = parts;

  if (owners.length && isValidGlob(glob)) {
    return {
      glob: join(dirname(filePath), glob),
      owners,
    };
  } else {
    throw new Error(`${rule} in ${filePath} can not be parsed`);
  }
};
export const loadCodeOwnerFiles = async (dirname: string, files: string[]): Promise<ownerRule[]> => {
  const codeOwners = await Promise.all(
    files.map(async (filePath) => {
      const rawContent = await readFile(filePath);

      const content = rawContent.toString();

      return parseCodeOwner(filePath.replace(`${dirname}/`, ''), content);
    })
  );
  return codeOwners.reduce((memo, rules) => [...memo, ...rules], []);
};
