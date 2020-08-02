import { logger } from './debug';
import { sync } from 'fast-glob';
import { IGNORE_FILES_PATTERN } from './constants';
import { readContent } from './readContent';

const debug = logger('parseIgnoreFiles');

export const getPatternsFromIgnoreFiles = async (): Promise<string[]> => {
  const matches = sync(IGNORE_FILES_PATTERN, {
    onlyFiles: true,
    absolute: true,
  });

  debug('found', matches);

  const filesContent = await Promise.all(
    matches.map(async (filePath) => {
      try {
        const content = await readContent(filePath);
        const lines = content.split('\n').filter((line) => line && !line.startsWith('#'));

        return lines;
      } catch (e) {
        debug(`We failed when reading ${filePath}, skipping file. reason: `, e);
        return [];
      }
    })
  );

  const patterns = filesContent.reduce((memo, patterns) => [...memo, ...patterns], [] as string[]);

  debug('ignore patterns found:', patterns);

  return patterns;
};
