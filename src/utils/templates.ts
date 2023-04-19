import { stripIndents } from 'common-tags';
import { CONTENT_MARK } from './constants';

const getContentLegend = (customRegenerationCommand?: string) => stripIndents`
# This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
# ${
  customRegenerationCommand ? `To re-generate, run \`${customRegenerationCommand}\`. ` : ''
}Don't worry, the content outside this block will be kept. 
`;

export const generatedContentTemplate = (generatedContent: string, customRegenerationCommand?: string) => {
  return stripIndents`
  ${CONTENT_MARK}
  ${getContentLegend(customRegenerationCommand)}\n
  ${generatedContent}\n
  ${CONTENT_MARK}\n
  `;
};
export const rulesBlockTemplate = (source: string, entries: string[]): string => {
  return stripIndents`
  # Rule${entries.length > 1 ? 's' : ''} extracted from ${source}${
    entries.some((rule) => rule.trim().includes(' ')) ? '' : ' (containing path exclusions)'
  }
  ${entries.join('\n')}
  `;
};
