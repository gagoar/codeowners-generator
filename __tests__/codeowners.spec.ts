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
  });
});
