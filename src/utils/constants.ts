import { stripIndents } from 'common-tags';
export const SUCCESS_SYMBOL = '💫';
export const SHRUG_SYMBOL = '¯\\_(ツ)_/¯';
export const OUTPUT = 'CODEOWNERS';
export const INCLUDES = ['**/CODEOWNERS', '!CODEOWNERS', '!.github/CODEOWNERS', '!docs/CODEOWNERS', '!node_modules'];
export const PACKAGE_JSON_PATTERN = ['**/package.json'];
export const IGNORE_ROOT_PACKAGE_JSON_PATTERN = ['!package.json'];
export const MAINTAINERS_EMAIL_PATTERN = /<(.+)>/;
export const IGNORE_FILES_PATTERN = ['.gitignore'];
export const CHARACTER_RANGE_PATTERN = /\[(?:.-.)+\]/;

export const CONTENT_MARK = stripIndents`
#################################### Generated content - do not edit! ####################################
`;

const getContentLegend = (customRegenerationCommand?: string) => stripIndents`
# This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
# ${
  customRegenerationCommand ? `To re-generate, run \`${customRegenerationCommand}\`. ` : ''
}Don't worry, the content outside this block will be kept. 
`;

export const contentTemplate = (
  generatedContent: string,
  originalContent: string,
  customRegenerationCommand?: string
) => {
  return stripIndents`
  ${originalContentTemplate(originalContent)}
  ${generatedContentTemplate(generatedContent, customRegenerationCommand)}
`;
};

export const originalContentTemplate = (originalContent: string) => originalContent && originalContent.trimEnd();
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
  # Rule${entries.length > 1 ? 's' : ''} extracted from ${source}
  ${entries.join('\n')}
  `;
};
