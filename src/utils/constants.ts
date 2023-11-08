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
// A line ending can either be CRLF (\r\n) or LF (\n), common in Windows- and Unix-based systems respectively.
export const LINE_ENDING_PATTERN = /\r?\n/;

export const CONTENT_MARK = stripIndents`
#################################### Generated content - do not edit! ####################################
`;
