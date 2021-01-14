import { loadCodeOwnerFiles } from './codeowners';
import { readContent } from './readContent';
import { mocked } from 'ts-jest/utils';

jest.mock('./readContent');

const readContentMock = mocked(readContent);

describe('Codeowners', () => {
  describe('loadCodeOwnerFiles', () => {
    it('should throw if a rule is missing owners', async () => {
      readContentMock.mockResolvedValueOnce('*.ts');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).rejects.toThrowError(
        '*.ts in dir1/CODEOWNERS: Rule is missing an owner'
      );
    });

    it("should throw if a rule's glob pattern is invalid", async () => {
      readContentMock.mockResolvedValueOnce(' @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).rejects.toThrowError(
        ' @eeny in dir1/CODEOWNERS: Rule glob pattern is not valid'
      );
    });

    it('should throw if a rule is using ! to negate a pattern', async () => {
      readContentMock.mockResolvedValueOnce('!*.ts @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).rejects.toThrowError(
        '!*.ts @eeny in dir1/CODEOWNERS: Rule cannot contain negations'
      );
    });

    it('should throw if a rule is using [ ] to define a character range', async () => {
      readContentMock.mockResolvedValueOnce('[a-z].ts @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).rejects.toThrowError(
        '[a-z].ts @meeny in dir1/CODEOWNERS: Rule cannot contain brackets'
      );
    });

    it('should throw if a rule is using braces', async () => {
      readContentMock.mockResolvedValueOnce('*.{txt,md} @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).rejects.toThrowError(
        '*.{txt,md} @miny in dir1/CODEOWNERS: Rule cannot contain braces'
      );
    });

    it('should throw if a rule is escaping a pattern starting with # using  so it is treated as a pattern and not a comment', async () => {
      readContentMock.mockResolvedValueOnce('\\#fileName @moe');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).rejects.toThrowError(
        '#fileName @moe in dir1/CODEOWNERS: Rule cannot start with escaped #'
      );
    });

    it('should allow rules with escaped brackets', async () => {
      readContentMock.mockResolvedValueOnce('[*].ts @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/**/[*].ts', owners: ['@eeny'] },
      ]);
    });

    it('should match *.ts to all ts file under the given directory and its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('*.ts @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/**/*.ts', owners: ['@meeny'] },
      ]);
    });

    it('should only match /*.ts to ts file in the given directory and not its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('/*.ts @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/*.ts', owners: ['@miny'] },
      ]);
    });

    it('should match apps/ to any directories named apps in the given directory and its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('apps/ @moe');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/**/apps/', owners: ['@moe'] },
      ]);
    });

    it('should match docs/* to files under directly inside a directory named docs in the given directory', async () => {
      readContentMock.mockResolvedValueOnce('docs/* @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/docs/*', owners: ['@eeny'] },
      ]);
    });

    it('should match filenames to files in the given directory and its subdirectories', async () => {
      readContentMock.mockResolvedValueOnce('README.md @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/**/README.md', owners: ['@meeny'] },
      ]);
    });

    it('should append globstar patterns to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('**/something.ts @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/**/something.ts', owners: ['@miny'] },
      ]);
    });

    it('should append globstar/glob patterns to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('**/*.ts @moe');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/**/*.ts', owners: ['@moe'] },
      ]);
    });

    it('should append glob patterns with fixed base to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('dir2/*.ts @eeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/dir2/*.ts', owners: ['@eeny'] },
      ]);
    });

    it('should append static file patterns to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('dir2/something.ts @meeny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/dir2/something.ts', owners: ['@meeny'] },
      ]);
    });

    it('should append static directory patterns to the given directory', async () => {
      readContentMock.mockResolvedValueOnce('dir2/dir3/ @miny');

      await expect(loadCodeOwnerFiles('/root', ['/root/dir1/CODEOWNERS'])).resolves.toEqual([
        { filePath: 'dir1/CODEOWNERS', glob: 'dir1/dir2/dir3/', owners: ['@miny'] },
      ]);
    });
  });
});
