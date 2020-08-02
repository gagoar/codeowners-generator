import debug, { Debugger } from 'debug';
import { name } from '../../package.json';
export function logger(nameSpace: string): Debugger {
  const log = debug(`${name}:${nameSpace}`);
  log.log = console.log.bind(console);
  return log;
}
