import { stripIndents } from 'common-tags';
import { existsSync } from 'fs';
export const SUCCESS_SYMBOL = '💫';
export const SHRUG_SYMBOL = '¯\\_(ツ)_/¯';
export const OUTPUT = 'CODEOWNERS';
export const INCLUDES = ['**/CODEOWNERS', '!CODEOWNERS', '!node_modules'];
export const PACKAGE_JSON_PATTERN = ['**/package.json'];
export const MAINTAINERS_EMAIL_PATTERN = /<(.+)>/;
export const IGNORE_FILES_PATTERN = ['.gitignore'];

export const CONTENT_MARK = stripIndents`
#################################### Generated content - do not edit! ####################################
`;
const CONTENT_LEGEND_NPM = stripIndents`
# This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
# To re-generate, run \`npm run codeowners-generator generate\`. Don't worry, the content outside this block will be kept. 
`;
const CONTENT_LEGEND_YARN = stripIndents`
# This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
# To re-generate, run \`yarn codeowners-generator generate\`. Don't worry, the content outside this block will be kept. 
`;

const getContentLegend = () => (existsSync('./yarn.lock') ? CONTENT_LEGEND_YARN : CONTENT_LEGEND_NPM);

export const contentTemplate = (generatedContent: string, originalContent: string): string => {
  return stripIndents`
  ${originalContent && originalContent}
  ${CONTENT_MARK}
  ${getContentLegend()}\n
  ${generatedContent}\n
  ${CONTENT_MARK}\n
`;
};
