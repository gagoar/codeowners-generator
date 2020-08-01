import fs from 'fs';
import { stripIndents } from 'common-tags';
import { GENERATED_FILE_LEGEND, MAINTAINERS_EMAIL_PATTERN } from './constants';
import isValidGlob from 'is-valid-glob';
import { dirname, join } from 'path';
import { readContent } from './readContent';

const isString = (x: unknown): x is string => {
  return typeof x === 'string';
};

const isObject = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === 'object';

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
      const content = await readContent(filePath);

      return parseCodeOwner(filePath.replace(`${dirname}/`, ''), content);
    })
  );
  return codeOwners.reduce((memo, rules) => [...memo, ...rules], []);
};

interface PACKAGE {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maintainers: any[];
}

const getOwnersFromMaintainerField = (filePath: string, content: string): ownerRule => {
  try {
    const { maintainers = [] } = JSON.parse(content) as PACKAGE;

    let owners = [] as string[];
    if (maintainers.length) {
      owners = maintainers.reduce((memo, maintainer) => {
        if (isString(maintainer)) {
          const matches = maintainer.match(MAINTAINERS_EMAIL_PATTERN);
          if (matches?.length) return [...memo, matches[1]];
        } else if (isObject(maintainer) && 'email' in maintainer && isString(maintainer.email)) {
          return [...memo, maintainer.email];
        }

        return memo;
      }, [] as string[]);

      if (!owners.length) {
        throw new Error(
          `malformed maintainer entry ${maintainers} this file will be skipped. for more info https://classic.yarnpkg.com/en/docs/package-json/#toc-maintainers`
        );
      }

      return {
        filePath,
        glob: `${dirname(filePath)}/`,
        owners,
      };
    } else {
      throw new Error('No maintainers found, this file will be skipped.');
    }
  } catch (e) {
    throw new Error(`Parsing ${filePath}: ${e}`);
  }
};
export const loadOwnersFromPackage = async (dirname: string, files: string[]): Promise<ownerRule[]> => {
  const codeOwners = await Promise.all(
    files.map(async (filePath) => {
      const content = await readContent(filePath);

      try {
        return getOwnersFromMaintainerField(filePath.replace(`${dirname}/`, ''), content);
      } catch (e) {
        return undefined;
      }
    })
  );

  // https://github.com/microsoft/TypeScript/issues/30621
  return codeOwners.filter(Boolean) as ownerRule[];
};
