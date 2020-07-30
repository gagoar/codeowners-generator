import * as fs from 'fs';
import * as fg from 'fast-glob';

import { generate, command } from '../src/commands/generate';
import { fail, stopAndPersist } from '../__mocks__/ora';
import path from 'path';

jest.mock('fs');
jest.mock('fast-glob');
jest.mock('cosmiconfig');

const { readFileSync } = jest.requireActual('fs');
const sync = fg.sync as jest.Mock<unknown>;
const readFile = (fs.readFile as unknown) as jest.Mock<unknown>;
const writeFile = (fs.writeFileSync as unknown) as jest.Mock<unknown>;

const files = {
  'dir1/CODEOWNERS': '../__mocks__/CODEOWNERS1',
  'dir2/CODEOWNERS': '../__mocks__/CODEOWNERS2',
  'dir2/dir3/CODEOWNERS': '../__mocks__/CODEOWNERS3',
};

const mockedFullPath = '/full/path';
const fullPathFiles = Object.keys(files).map((fileName) => path.join(mockedFullPath, fileName));

type Callback = (err: Error | null, response: unknown) => void;
describe('Generate', () => {
  beforeEach(() => {
    sync.mockClear();
    stopAndPersist.mockClear();
    writeFile.mockClear();
  });

  it('should generate a CODEOWNERS FILE', async () => {
    sync.mockReturnValue(fullPathFiles);

    readFile.mockImplementation((file: string, callback: Callback) => {
      const fileName = file.replace(`${mockedFullPath}/`, '') as keyof typeof files;
      const content = readFileSync(path.join(__dirname, files[fileName]));
      callback(null, content);
    });

    await command({ parent: {}, output: 'CODEOWNERS' });
    expect(writeFile.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "CODEOWNERS",
          "
      // Generated File - do not edit!
      // This file has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
      // To re-generate, run npm run codeowners-generator generate.

      # Rule extracted from /full/path/dir1/CODEOWNERS
      /full/path/dir1/*.ts @eeny @meeny
      # Rule extracted from /full/path/dir1/CODEOWNERS
      /full/path/dir1/README.md @miny
      # Rule extracted from /full/path/dir2/CODEOWNERS
      /full/path/dir2/*.ts @moe
      # Rule extracted from /full/path/dir2/CODEOWNERS
      /full/path/dir2/dir3/*.ts @miny
      # Rule extracted from /full/path/dir2/dir3/CODEOWNERS
      /full/path/dir2/dir3/*.ts @miny",
        ],
      ]
    `);
  });

  it('should generate a CODEOWNERS FILE with package.maintainers field', async () => {
    const addPackageFiles = {
      ...files,
      'dir5/package.json': '../__mocks__/package1.json',
      'dir2/dir1/package.json': '../__mocks__/package2.json',
    };
    sync.mockReturnValueOnce([
      ...fullPathFiles,
      path.join(mockedFullPath, 'dir5/package.json'),
      path.join(mockedFullPath, 'dir2/dir1/package.json'),
    ]);

    readFile.mockImplementation((file: string, callback: Callback) => {
      const fileName = file.replace(`${mockedFullPath}/`, '') as keyof typeof addPackageFiles;
      const content = readFileSync(path.join(__dirname, addPackageFiles[fileName]));
      callback(null, content);
    });

    await command({ parent: {}, output: 'CODEOWNERS', useMaintainers: true });
    expect(writeFile.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "CODEOWNERS",
          "
      // Generated File - do not edit!
      // This file has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
      // To re-generate, run npm run codeowners-generator generate.

      # Rule extracted from /full/path/dir5/package.json
      /full/path/dir5/ friend@example.com other@example.com
      # Rule extracted from /full/path/dir2/dir1/package.json
      /full/path/dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from /full/path/dir1/CODEOWNERS
      /full/path/dir1/*.ts @eeny @meeny
      # Rule extracted from /full/path/dir1/CODEOWNERS
      /full/path/dir1/README.md @miny
      # Rule extracted from /full/path/dir2/CODEOWNERS
      /full/path/dir2/*.ts @moe
      # Rule extracted from /full/path/dir2/CODEOWNERS
      /full/path/dir2/dir3/*.ts @miny
      # Rule extracted from /full/path/dir2/dir3/CODEOWNERS
      /full/path/dir2/dir3/*.ts @miny",
        ],
      ]
    `);
  });
  it('should return rules', async () => {
    sync.mockReturnValue(fullPathFiles);
    readFile.mockImplementation((file: string, callback: Callback) => {
      const fileName = file.replace(`${mockedFullPath}/`, '') as keyof typeof files;
      const content = readFileSync(path.join(__dirname, files[fileName]));
      callback(null, content);
    });

    const response = await generate({ rootDir: __dirname });
    expect(response).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "/full/path/dir1/CODEOWNERS",
          "glob": "/full/path/dir1/*.ts",
          "owners": Array [
            "@eeny",
            "@meeny",
          ],
        },
        Object {
          "filePath": "/full/path/dir1/CODEOWNERS",
          "glob": "/full/path/dir1/README.md",
          "owners": Array [
            "@miny",
          ],
        },
        Object {
          "filePath": "/full/path/dir2/CODEOWNERS",
          "glob": "/full/path/dir2/*.ts",
          "owners": Array [
            "@moe",
          ],
        },
        Object {
          "filePath": "/full/path/dir2/CODEOWNERS",
          "glob": "/full/path/dir2/dir3/*.ts",
          "owners": Array [
            "@miny",
          ],
        },
        Object {
          "filePath": "/full/path/dir2/dir3/CODEOWNERS",
          "glob": "/full/path/dir2/dir3/*.ts",
          "owners": Array [
            "@miny",
          ],
        },
      ]
    `);
  });

  it('should not find any rules', async () => {
    sync.mockReturnValue([]);
    await command({
      parent: {
        includes: ['**/NOT_STANDARD_CODEOWNERS'],
      },
    });
    expect(stopAndPersist.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "symbol": "💫",
            "text": "No custom configuration found",
          },
        ],
        Array [
          Object {
            "symbol": "¯\\\\_(ツ)_/¯",
            "text": "We couldn't find any codeowners under **/NOT_STANDARD_CODEOWNERS",
          },
        ],
      ]
    `);
  });

  it('should blow up after finding malformed CODEOWNER', async () => {
    const addedMalformedFiles = {
      ...files,
      'dir4/CODEOWNERS': '../__mocks__/CODEOWNERS4',
    };
    sync.mockReturnValue([...fullPathFiles, path.join(mockedFullPath, 'dir4/CODEOWNERS')]);

    readFile.mockImplementation((file: string, callback: Callback) => {
      const fileName = file.replace(`${mockedFullPath}/`, '') as keyof typeof addedMalformedFiles;
      const content = readFileSync(path.join(__dirname, addedMalformedFiles[fileName]));
      callback(null, content);
    });
    await command({ parent: {}, output: 'CODEOWNERS' });
    expect(fail.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "We encountered an error: Error: *.ts in /full/path/dir4/CODEOWNERS can not be parsed",
        ],
      ]
    `);
  });
});
