import { loadCodeOwnerFiles } from './codeowners';
import { readContent } from './readContent';
import { mocked } from 'ts-jest/utils';

jest.mock('./readContent');

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

    it('should match * to all file under the given directory and its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('* @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/**/*', owners: ['@meeny'] },
      ]);
    });

    it('should only match /* to all file in the root of the given directory and not its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('/* @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/*', owners: ['@miny'] },
      ]);
    });

    it('should match *.ts to all ts file under the given directory and its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('*.ts @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/**/*.ts', owners: ['@meeny'] },
      ]);
    });

    it('should only match /*.ts to ts file in the given directory and not its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('/*.ts @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/*.ts', owners: ['@miny'] },
      ]);
    });

    it('should match apps/ to any directories named apps in the given directory and its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('apps/ @moe');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/**/apps/', owners: ['@moe'] },
      ]);
    });

    it('should match docs/* to files under directly inside a directory named docs in the given directory', async () => {
      readContentMock.mockResolvedValueOnce('docs/* @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/docs/*', owners: ['@eeny'] },
      ]);
    });

    it('should match filenames to files in the given directory and its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('README.md @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/**/README.md', owners: ['@meeny'] },
      ]);
    });

    it('should append globstar patterns to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('**/something.ts @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/**/something.ts', owners: ['@miny'] },
      ]);
    });

    it('should append globstar/glob patterns to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('**/*.ts @moe');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/**/*.ts', owners: ['@moe'] },
      ]);
    });

    it('should append glob patterns with fixed base to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('dir2/*.ts @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/dir2/*.ts', owners: ['@eeny'] },
      ]);
    });

    it('should append static file patterns to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('dir2/something.ts @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/dir2/something.ts', owners: ['@meeny'] },
      ]);
    });

    it('should append static directory patterns (dir2/dir3/) to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('dir2/dir3/ @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/dir2/dir3/', owners: ['@miny'] },
      ]);
    });

    it('should append patterns starting with a slash (/) to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('/ @moe');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/', owners: ['@moe'] },
      ]);
    });

    it('should append file patterns starting with a slash (/asd/asd.ts) to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('/asd/asd.ts @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/asd/asd.ts', owners: ['@eeny'] },
      ]);
    });

    it('should append glob patterns starting with a slash (/**/asd.ts) to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('/**/asd.ts @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: '/dir1/**/asd.ts', owners: ['@meeny'] },
      ]);
    });
  });
});
