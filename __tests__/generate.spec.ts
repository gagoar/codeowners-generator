import * as fs from 'fs';
import * as fg from 'fast-glob';

import { generate, command } from '../src/commands/generate';
import { stopAndPersist } from '../__mocks__/ora';
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

const fullPathFiles = Object.keys(files).map((fileName) => path.join(__dirname, fileName));

type Callback = (err: Error | null, response: unknown) => void;
describe('Generate', () => {
  beforeEach(() => {
    stopAndPersist.mockClear();
  });
  it('should generate a CODEOWNERS FILE', async () => {
    sync.mockReturnValue(fullPathFiles);

    readFile.mockImplementation((file: string, callback: Callback) => {
      const fileName = file.replace(`${__dirname}/`, '') as keyof typeof files;
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

      # Rule extracted from /Users/gfrigerio/base/codeowners-generator/__tests__/dir1/CODEOWNERS
      /Users/gfrigerio/base/codeowners-generator/__tests__/dir1/*.ts @eeny @meeny
      # Rule extracted from /Users/gfrigerio/base/codeowners-generator/__tests__/dir1/CODEOWNERS
      /Users/gfrigerio/base/codeowners-generator/__tests__/dir1/README.md @miny
      # Rule extracted from /Users/gfrigerio/base/codeowners-generator/__tests__/dir2/CODEOWNERS
      /Users/gfrigerio/base/codeowners-generator/__tests__/dir2/*.ts @moe
      # Rule extracted from /Users/gfrigerio/base/codeowners-generator/__tests__/dir2/CODEOWNERS
      /Users/gfrigerio/base/codeowners-generator/__tests__/dir2/dir3/*.ts @miny
      # Rule extracted from /Users/gfrigerio/base/codeowners-generator/__tests__/dir2/dir3/CODEOWNERS
      /Users/gfrigerio/base/codeowners-generator/__tests__/dir2/dir3/*.ts @miny",
        ],
      ]
    `);
  });
  it('should return rules', async () => {
    sync.mockReturnValue(fullPathFiles);
    readFile.mockImplementation((file: string, callback: Callback) => {
      const fileName = file.replace(`${__dirname}/`, '') as keyof typeof files;
      const content = readFileSync(path.join(__dirname, files[fileName]));
      callback(null, content);
    });

    const response = await generate({ rootDir: __dirname });
    expect(response).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "dir1/CODEOWNERS",
          "glob": "dir1/*.ts",
          "owners": Array [
            "@eeny",
            "@meeny",
          ],
        },
        Object {
          "filePath": "dir1/CODEOWNERS",
          "glob": "dir1/README.md",
          "owners": Array [
            "@miny",
          ],
        },
        Object {
          "filePath": "dir2/CODEOWNERS",
          "glob": "dir2/*.ts",
          "owners": Array [
            "@moe",
          ],
        },
        Object {
          "filePath": "dir2/CODEOWNERS",
          "glob": "dir2/dir3/*.ts",
          "owners": Array [
            "@miny",
          ],
        },
        Object {
          "filePath": "dir2/dir3/CODEOWNERS",
          "glob": "dir2/dir3/*.ts",
          "owners": Array [
            "@miny",
          ],
        },
      ]
    `);
  });

  it('should not find any rules', async () => {
    sync.mockReturnValue([]);
    await command({ parent: {}, output: 'CODEOWNERS' });
    expect(stopAndPersist).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Object {
              "symbol": "💫",
              "text": "No custom configuration found",
            },
          ],
          Array [
            Object {
              "symbol": "¯\\\\_(ツ)_/¯",
              "text": "We couldn't find any codeowners under **/CODEOWNERS",
            },
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
  });

  // it('should blow up after finding malformed CODEOWNER', async () => {
  //   sync.mockReturnValue([]);
  //   await command({ parent: {}, output: 'CODEOWNERS' });
  //   expect(fail.mock).toMatchInlineSnapshot('Array []');
  // });
});
