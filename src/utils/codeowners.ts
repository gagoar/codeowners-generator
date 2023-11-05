import fs from 'fs';
import isGlob from 'is-glob';
import { MAINTAINERS_EMAIL_PATTERN, CONTENT_MARK, CHARACTER_RANGE_PATTERN } from './constants';
import { dirname, join } from 'path/posix';
import { readContent } from './readContent';
import { logger } from '../utils/debug';
import groupBy from 'lodash.groupby';
import { generatedContentTemplate, rulesBlockTemplate } from './templates';

const debug = logger('utils/codeowners');

const isString = (x: unknown): x is string => {
  return typeof x === 'string';
};

const isObject = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === 'object';

export type ownerRule = {
  filePath: string;
  owners: string[];
  glob: string;
};

const filterGeneratedContent = (content: string): [withoutGeneratedCode: string[], blockPosition: number] => {
  const lines = content.split('\n');

  let skip = false;
  let generatedBlockPosition = -1;

  const withoutGeneratedCode = lines.reduce((memo, line, index) => {
    if (line === CONTENT_MARK) {
      skip = !skip;
      if (generatedBlockPosition === -1) {
        generatedBlockPosition = index;
      }
      return memo;
    }

    return skip ? memo : [...memo, line];
  }, [] as string[]);

  return [withoutGeneratedCode, generatedBlockPosition];
};

type createOwnersFileResponse = [originalContent: string, newContent: string];
export const generateOwnersFile = async (
  outputFile: string,
  ownerRules: ownerRule[],
  groupSourceComments = false,
  preserveBlockPosition = false,
  customRegenerationCommand?: string
): Promise<createOwnersFileResponse> => {
  let originalContent = '';

  if (fs.existsSync(outputFile)) {
    debug(`output file ${outputFile} exists, extracting content before overwriting`);
    originalContent = await readContent(outputFile);
  }

  let content = [] as string[];

  if (groupSourceComments) {
    const groupedRules = groupBy(ownerRules, (rule) => rule.filePath);

    content = Object.keys(groupedRules).reduce((memo, filePath) => {
      const rules = groupedRules[filePath].map((rule) => `${rule.glob} ${rule.owners.join(' ')}`);
      return [...memo, rulesBlockTemplate(filePath, rules)];
    }, [] as string[]);
  } else {
    content = ownerRules.map((rule) => rulesBlockTemplate(rule.filePath, [`${rule.glob} ${rule.owners.join(' ')}`]));
  }
  const [withoutGeneratedCode, blockPosition] = filterGeneratedContent(originalContent);

  let normalizedContent = '';

  const generatedContent = generatedContentTemplate(content.join('\n'), customRegenerationCommand) + '\n';

  if (originalContent) {
    normalizedContent = withoutGeneratedCode.reduce((memo, line, index) => {
      if (preserveBlockPosition && index === blockPosition) {
        memo += generatedContent;
      }
      memo += line + '\n';

      return memo;
    }, '');
  }

  if (!preserveBlockPosition) {
    normalizedContent = normalizedContent + generatedContent;
  }

  return [originalContent, normalizedContent.trimEnd()];
};

const parseCodeOwner = (filePath: string, codeOwnerContent: string): ownerRule[] => {
  const content = codeOwnerContent.split('\n');

  // TODO: include comments optionally.
  const filteredRules = content.filter((line) => line && !line.startsWith('#'));

  return filteredRules.map((rule) => ({ filePath, ...createMatcherCodeownersRule(filePath, rule) }));
};

const isValidCodeownersGlob = (glob: string) => {
  // These controls are based on the Github CODEOWNERS syntax documentation
  // https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners#codeowners-syntax
  // as well as the gitignore pattern format which it extends
  // https://git-scm.com/docs/gitignore#_pattern_format

  const isGlobString = isString(glob);
  const isNotEmpty = glob.length > 0;
  const isNotNegated = !glob.startsWith('!');
  const doesNotUseBraceExpansion = !glob.includes('{') && !glob.includes('}');
  const doesNotStartWithEscapedHash = !glob.startsWith('\\#');
  const doesNotUseCharacterRange = !isGlob(glob) || !CHARACTER_RANGE_PATTERN.test(glob);

  return (
    isGlobString &&
    isNotEmpty &&
    isNotNegated &&
    doesNotUseBraceExpansion &&
    doesNotStartWithEscapedHash &&
    doesNotUseCharacterRange
  );
};

const translateGlob = (glob: string) => {
  if (glob.startsWith('/')) {
    // Patterns starting with a slash should match based on the current dir.
    return glob;
  }

  if (!glob.includes('/') && !glob.includes('**')) {
    // For patterns that are might be globs but not globstars, they match
    // they match files in any folder.
    // This matches e.g. `*`, `*.ts`, `something.ts`, and `something`.
    return join('**', glob);
  }

  if (!isGlob(glob) && glob.indexOf('/') === glob.length - 1) {
    // For patterns that are not globs and contain one slash trailing slash (e.g. `apps/`),
    // they match directories in any folder.
    return join('**', glob);
  }

  return glob;
};

const createMatcherCodeownersRule = (filePath: string, rule: string) => {
  const parts = rule.split(/\s+/);
  const [glob, ...owners] = parts;

  if (isValidCodeownersGlob(glob)) {
    return {
      glob: join('/', dirname(filePath), translateGlob(glob)),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contributors: any[];
  author?: Record<string, string>;
}

const getOwnersFromMaintainerField = (filePath: string, content: string): ownerRule => {
  try {
    const { maintainers = [], contributors = [], author } = JSON.parse(content) as PACKAGE;

    const packageOwners = [...maintainers, ...contributors];

    if (author) {
      packageOwners.unshift(author);
    }

    let owners = [] as string[];
    if (packageOwners.length) {
      owners = packageOwners.reduce((memo, maintainer) => {
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
          `malformed maintainer entry ${maintainers} this file will be skipped. For more info https://classic.yarnpkg.com/en/docs/package-json/#toc-maintainers`
        );
      }

      let glob = join('/', dirname(filePath), '/');

      if (glob === '/') {
        // A slash ('/') for the root is not valid, using a glob-star is probably more reasonable.
        glob = '*';
      }

      return {
        filePath,
        glob,
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
