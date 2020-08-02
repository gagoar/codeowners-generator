import { stripIndents } from 'common-tags';
export const SUCCESS_SYMBOL = '💫';
export const SHRUG_SYMBOL = '¯\\_(ツ)_/¯';
export const OUTPUT = 'CODEOWNERS';
export const INCLUDES = ['**/CODEOWNERS', '!CODEOWNERS'];
export const PACKAGE_JSON_PATTERN = ['**/package.json'];
export const MAINTAINERS_EMAIL_PATTERN = /<(.+)>/;
export const IGNORE_FILES_PATTERN = ['.gitignore'];
export const OPEN_CONTENT_MARK = stripIndents`
#################################### Generated content - do not edit! ####################################
`;
export const CLOSE_CONTENT_MARK = stripIndents`
#################################### Generated content - do not edit! ####################################
  `;
export const CONTENT_LEGEND = stripIndents`
# This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
# To re-generate, run npm run codeowners-generator generate. Don't worry, the content outside this block will be kept. 
`;
export const contentTemplate = (content: string): string => stripIndents`
${OPEN_CONTENT_MARK}\n
${CONTENT_LEGEND}\n
${content}\n
${CLOSE_CONTENT_MARK}\n
`;
