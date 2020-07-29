import { cosmiconfig } from 'cosmiconfig';
import { SUCCESS_SYMBOL } from './constants';
import ora from 'ora';

import packageJSON from '../../package.json';

export type CustomConfig = Record<string, string | string[]>;

export const getCustomConfiguration = async (): Promise<CustomConfig | void> => {
  const loader = ora('Loading available configuration').start();

  try {
    const explorer = cosmiconfig(packageJSON.name);
    const result = await explorer.search();
    if (result?.config && typeof result.config === 'object') {
      loader.stopAndPersist({ text: `Custom configuration found in ${result.filepath}`, symbol: SUCCESS_SYMBOL });
      return result.config;
    } else {
      loader.stopAndPersist({ text: 'No custom configuration found', symbol: SUCCESS_SYMBOL });
      return {};
    }
  } catch (e) {
    loader.fail('We found an error looking for custom configuration, we will use cli options if provided');
  }
}
