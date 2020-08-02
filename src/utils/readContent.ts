import fs from 'fs';
import { promisify } from 'util';
import { logger } from './debug';

const debug = logger('readFile');
const readFile = promisify(fs.readFile);
export const readContent = async (filePath: string): Promise<string> => {
  debug('reading...', filePath);

  const rawContent = await readFile(filePath);

  const content = rawContent.toString();
  return content;
};
