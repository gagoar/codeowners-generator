import * as fs from 'fs';
import * as fg from 'fast-glob';

import { generateCommand } from '../';
import { generate } from '../src/commands/generate';
import { fail, stopAndPersist } from '../__mocks__/ora';
import { search } from '../__mocks__/cosmiconfig';
import path from 'path';

jest.mock('fs');
jest.mock('fast-glob');
jest.mock('cosmiconfig');

const { readFileSync } = jest.requireActual('fs');
const sync = fg.sync as jest.Mock<unknown>;
const readFile = (fs.readFile as unknown) as jest.Mock<unknown>;
const writeFile = (fs.writeFileSync as unknown) as jest.Mock<unknown>;
const existsSync = (fs.existsSync as unknown) as jest.Mock<unknown>;

const files = {
  'dir1/CODEOWNERS': '../__mocks__/CODEOWNERS1',
  'dir2/CODEOWNERS': '../__mocks__/CODEOWNERS2',
  'dir2/dir3/CODEOWNERS': '../__mocks__/CODEOWNERS3',
  'node_modules/dir1/CODEOWNERS': '../__mocks__/CODEOWNERS5',
};

const withGitIgnore = { ...files, '.gitignore': '../__mocks__/gitIgnore1' };

type Callback = (err: Error | null, response: unknown) => void;
describe('Generate', () => {
  beforeEach(() => {
    sync.mockRestore();
    stopAndPersist.mockClear();
    writeFile.mockClear();
    existsSync.mockRestore();
    search.mockRestore();
    fail.mockReset();
  });

  it('should generate a CODEOWNERS file (re-using codeowners content)', async () => {
    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    const withPopulatedCodeownersFile = {
      ...withGitIgnore,
      CODEOWNERS: '../__mocks__/CODEOWNERS_POPULATED_OUTPUT',
    };
    existsSync.mockReturnValue(true);
    readFile.mockImplementation((file: keyof typeof withPopulatedCodeownersFile, callback: Callback) => {
      const fullPath = path.join(__dirname, withPopulatedCodeownersFile[file]);
      console.warn('mocked file', file, fullPath);
      const content = readFileSync(fullPath);
      callback(null, content);
    });

    await generateCommand({ parent: {}, output: 'CODEOWNERS' });
    expect(writeFile.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "CODEOWNERS",
        "# We are already using CODEOWNERS and we don't want to lose the content of this file.
      scripts/ @myOrg/infraTeam
      # We might wanna keep an eye on something else, like yml files and workflows.
      .github/workflows/ @myOrg/infraTeam


      #################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
      # To re-generate, run \`yarn codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir1/CODEOWNERS
      dir1/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      dir1/README.md @miny
      # Rule extracted from dir2/CODEOWNERS
      dir2/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      dir2/dir3/*.ts @miny
      # Rule extracted from dir2/dir3/CODEOWNERS
      dir2/dir3/*.ts @miny

      #################################### Generated content - do not edit! ####################################",
      ]
    `);
  });
  it('should generate a CODEOWNERS FILE', async () => {
    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    readFile.mockImplementation((file: keyof typeof withGitIgnore, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, withGitIgnore[file]));
      callback(null, content);
    });

    await generateCommand({ parent: {}, output: 'CODEOWNERS' });
    expect(writeFile.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "CODEOWNERS",
          "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
      # To re-generate, run \`npm run codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir1/CODEOWNERS
      dir1/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      dir1/README.md @miny
      # Rule extracted from dir2/CODEOWNERS
      dir2/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      dir2/dir3/*.ts @miny
      # Rule extracted from dir2/dir3/CODEOWNERS
      dir2/dir3/*.ts @miny

      #################################### Generated content - do not edit! ####################################",
        ],
      ]
    `);
  });

  it('should generate a CODEOWNERS FILE with package.contributors and package.author field using cosmiconfig', async () => {
    search.mockImplementationOnce(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: {
          output: 'CODEOWNERS',
          useMaintainers: true,
        },
      })
    );

    const packageFiles = {
      ...files,
      'dir5/package.json': '../__mocks__/package1.json',
      'dir2/dir1/package.json': '../__mocks__/package2.json',
      'dir6/package.json': '../__mocks__/package3.json',
      'dir7/package.json': '../__mocks__/package4.json',
      'dir8/package.json': '../__mocks__/package5.json',
    };

    sync.mockReturnValueOnce(Object.keys(packageFiles));

    sync.mockReturnValueOnce(['.gitignore']);
    const withAddedPackageFiles = { ...packageFiles, ...withGitIgnore };
    readFile.mockImplementation((file: keyof typeof withAddedPackageFiles, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, withAddedPackageFiles[file]));
      callback(null, content);
    });

    await generateCommand({ parent: {} });
    expect(search).toHaveBeenCalled();
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
      # To re-generate, run \`npm run codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir5/package.json
      dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir8/package.json
      dir8/ gbuilder@builder.com other.friend@domain.com
      # Rule extracted from dir1/CODEOWNERS
      dir1/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      dir1/README.md @miny
      # Rule extracted from dir2/CODEOWNERS
      dir2/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      dir2/dir3/*.ts @miny
      # Rule extracted from dir2/dir3/CODEOWNERS
      dir2/dir3/*.ts @miny

      #################################### Generated content - do not edit! ####################################"
    `);
  });
  it('should generate a CODEOWNERS FILE with package.maintainers field using cosmiconfig', async () => {
    search.mockImplementationOnce(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: {
          output: '.github/CODEOWNERS',
          useMaintainers: true,
          includes: ['dir1/*', 'dir2/*', 'dir5/*', 'dir6/*', 'dir7/*'],
        },
      })
    );

    const packageFiles = {
      ...files,
      'dir5/package.json': '../__mocks__/package1.json',
      'dir2/dir1/package.json': '../__mocks__/package2.json',
      'dir6/package.json': '../__mocks__/package3.json',
      'dir7/package.json': '../__mocks__/package4.json',
    };

    sync.mockReturnValueOnce(Object.keys(packageFiles));

    sync.mockReturnValueOnce(['.gitignore']);
    const withAddedPackageFiles = { ...packageFiles, ...withGitIgnore };
    readFile.mockImplementation((file: keyof typeof withAddedPackageFiles, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, withAddedPackageFiles[file]));
      callback(null, content);
    });

    await generateCommand({ parent: {} });
    expect(search).toHaveBeenCalled();
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
      # To re-generate, run \`npm run codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir5/package.json
      dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir1/CODEOWNERS
      dir1/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      dir1/README.md @miny
      # Rule extracted from dir2/CODEOWNERS
      dir2/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      dir2/dir3/*.ts @miny
      # Rule extracted from dir2/dir3/CODEOWNERS
      dir2/dir3/*.ts @miny

      #################################### Generated content - do not edit! ####################################"
    `);
  });
  it('should generate a CODEOWNERS FILE with package.maintainers field', async () => {
    const packageFiles = {
      ...files,
      'dir5/package.json': '../__mocks__/package1.json',
      'dir2/dir1/package.json': '../__mocks__/package2.json',
      'dir6/package.json': '../__mocks__/package3.json',
      'dir7/package.json': '../__mocks__/package4.json',
    };

    sync.mockReturnValueOnce([
      ...Object.keys(packageFiles),
      'dir5/package.json',
      'dir2/dir1/package.json',
      'dir6/package.json',
      'dir7/package.json',
    ]);

    sync.mockReturnValueOnce(['.gitignore']);
    const withAddedPackageFiles = { ...packageFiles, ...withGitIgnore };
    readFile.mockImplementation((file: keyof typeof withAddedPackageFiles, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, withAddedPackageFiles[file]));
      callback(null, content);
    });

    await generateCommand({ parent: {}, output: 'CODEOWNERS', useMaintainers: true });
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator/README.md)
      # To re-generate, run \`npm run codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir5/package.json
      dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir5/package.json
      dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir1/CODEOWNERS
      dir1/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      dir1/README.md @miny
      # Rule extracted from dir2/CODEOWNERS
      dir2/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      dir2/dir3/*.ts @miny
      # Rule extracted from dir2/dir3/CODEOWNERS
      dir2/dir3/*.ts @miny

      #################################### Generated content - do not edit! ####################################"
    `);
  });
  it('should return rules', async () => {
    sync.mockReturnValueOnce(Object.keys(files));
    sync.mockReturnValueOnce(['.gitignore']);

    const filesWithIgnore = {
      ...files,
      ...withGitIgnore,
    };
    readFile.mockImplementation((file: keyof typeof filesWithIgnore, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, filesWithIgnore[file]));
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
    await generateCommand({
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

  it('should show customConfiguration is malformed', async () => {
    sync.mockReturnValueOnce(Object.keys(files));
    sync.mockReturnValueOnce(['.gitignore']);

    const filesWithIgnore = {
      ...files,
      ...withGitIgnore,
    };
    readFile.mockImplementation((file: keyof typeof filesWithIgnore, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, filesWithIgnore[file]));
      callback(null, content);
    });
    search.mockImplementationOnce(() => Promise.reject(new Error('some malformed configuration')));

    await generateCommand({ parent: {} });
    expect(fail.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "We found an error looking for custom configuration, we will use cli options if provided",
        ],
      ]
    `);
  });

  it('should fail trying to read .gitignore', async () => {
    sync.mockReturnValueOnce(Object.keys(files));
    sync.mockReturnValueOnce(['.gitignore']);

    readFile.mockImplementation((file: keyof typeof files, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, files[file]));
      callback(null, content);
    });

    await generateCommand({ parent: {} });
    expect(writeFile).toHaveBeenCalled();
  });

  it('should blow up after finding malformed CODEOWNERS', async () => {
    const addedMalformedFiles = {
      ...files,
      'dir4/CODEOWNERS': '../__mocks__/CODEOWNERS4',
    };
    sync.mockReturnValueOnce([...Object.keys(files), 'dir4/CODEOWNERS']);
    sync.mockReturnValueOnce([]);
    search.mockImplementationOnce(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: {
          output: 'CODEOWNERS',
          useMaintainers: true,
        },
      })
    );

    readFile.mockImplementation((file: keyof typeof addedMalformedFiles, callback: Callback) => {
      const content = readFileSync(path.join(__dirname, addedMalformedFiles[file]));
      callback(null, content);
    });

    await generateCommand({ parent: {}, output: 'CODEOWNERS' });
    expect(fail.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "We encountered an error: Error: *.ts in dir4/CODEOWNERS can not be parsed",
      ]
    `);
  });
});
