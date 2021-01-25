import { loadCodeOwnerFiles } from '../src/utils/codeowners';
import { readContent } from '../src/utils/readContent';
import { mocked } from 'ts-jest/utils';

jest.mock('../src/utils/readContent');

const readContentMock = mocked(readContent);

describe('Codeowners', () => {
  describe('loadCodeOwnerFiles', () => {
    const invalidRuleCases = [
      ['should throw if a rule is missing owners', '*.ts', '*.ts in dir1/CODEOWNERS can not be parsed'],
      ['should throw if a rule is missing a file pattern', ' @eeny', ' @eeny in dir1/CODEOWNERS can not be parsed'],
      [
        'should throw if a rule is using ! to negate a pattern',
        '!*.ts @eeny',
        '!*.ts @eeny in dir1/CODEOWNERS can not be parsed',
      ],
      [
        'should throw if a pattern is using [ ] to define a character range',
        '[a-z].ts @meeny',
        '[a-z].ts @meeny in dir1/CODEOWNERS can not be parsed',
      ],
      [
        'should throw if a pattern is using braces for brace expansion or brace sets',
        '*.{txt,md} @miny',
        '*.{txt,md} @miny in dir1/CODEOWNERS can not be parsed',
      ],
      [
        'should throw if a pattern is escaping a pattern starting with # using \\ so it is treated as a pattern and not a comment',
        '\\#fileName @moe',
        '\\#fileName @moe in dir1/CODEOWNERS can not be parsed',
      ],
    ];

    it.each(invalidRuleCases)('%s (%s)', async (_name, rule, expectedError) => {
      readContentMock.mockResolvedValueOnce(rule);

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).rejects.toThrowError(expectedError);
    });

    const validRuleCases = [
      ['should match * to all file under the given directory and its subdirectories', '*', '/dir1/**/*'],
      [
        'should only match /* to all file in the root of the given directory and not its subdirectories',
        '/*',
        '/dir1/*',
      ],
      ['should match *.ts to all ts file under the given directory and its subdirectories', '*.ts', '/dir1/**/*.ts'],
      ['should only match /*.ts to ts file in the given directory and not its subdirectories', '/*.ts', '/dir1/*.ts'],
      [
        'should match apps/ to any directories named apps in the given directory and its subdirectories',
        'apps/',
        '/dir1/**/apps/',
      ],
      [
        'should match docs/* to files under directly inside a directory named docs in the given directory',
        'docs/*',
        '/dir1/docs/*',
      ],
      [
        'should match filenames to files in the given directory and its subdirectories',
        'README.md',
        '/dir1/**/README.md',
      ],
      ['should append globstar patterns to the given directory', '**/something.ts', '/dir1/**/something.ts'],
      ['should append globstar/glob patterns to the given directory', '**/*.ts', '/dir1/**/*.ts'],
      ['should append glob patterns with fixed base to the given directory', 'dir2/*.ts', '/dir1/dir2/*.ts'],
      ['should append static file patterns to the given directory', 'dir2/something.ts', '/dir1/dir2/something.ts'],
      ['should append static directory patterns (dir2/dir3/) to the given directory', 'dir2/dir3/', '/dir1/dir2/dir3/'],
      ['should append patterns starting with a slash (/) to the given directory', '/', '/dir1/'],
      [
        'should append file patterns starting with a slash (/asd/asd.ts) to the given directory',
        '/asd/asd.ts',
        '/dir1/asd/asd.ts',
      ],
      [
        'should append glob patterns starting with a slash (/**/asd.ts) to the given directory',
        '/**/asd.ts',
        '/dir1/**/asd.ts',
      ],
    ];

    it.each(validRuleCases)('%s (%s)', async (_name, pattern, expectedGlob) => {
      readContentMock.mockResolvedValueOnce(`${pattern} @eeny`);

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: expectedGlob, owners: ['@eeny'] },
      ]);
    });
  });
});
