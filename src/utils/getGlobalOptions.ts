import { getCustomConfiguration } from './getCustomConfiguration';
interface GlobalOptions {
  includes?: string[];
  output?: string;
}
export interface Command {
  parent: Partial<GlobalOptions>;
}

const makeArray = (field: unknown) => (field && Array.isArray(field) ? field : [field].filter(Boolean));

const getOptionsFromCommand = (command: Command): GlobalOptions => {
  const {
    parent: { includes },
  } = command;

  return { includes: makeArray(includes) };
};

export const getGlobalOptions = async (command: Command): Promise<GlobalOptions> => {
  const options = getOptionsFromCommand(command);

  const customConfiguration = await getCustomConfiguration();

  if (!options.includes?.length && customConfiguration && customConfiguration.includes?.length) {
    return { ...customConfiguration, ...options, includes: customConfiguration.includes };
  }

  return { ...customConfiguration, ...options };
};
