import * as fs from 'fs';
import * as fg from 'fast-glob';
import { mockProcessExit } from 'jest-mock-process';
import path from 'path';
import { generateCommand } from '../';
import { generate } from '../src/commands/generate';
import { fail, stopAndPersist } from '../__mocks__/ora';
import { search } from '../__mocks__/cosmiconfig';
import { mockConsole, unMockConsole } from './helpers';

jest.mock('fs');
jest.mock('fast-glob');
jest.mock('cosmiconfig');

const { readFileSync } = jest.requireActual('fs');
const sync = jest.mocked(fg.sync);
const readFile = jest.mocked(fs.readFile);
const writeFile = jest.mocked(fs.writeFileSync);
const existsSync = jest.mocked(fs.existsSync);

const files = {
  'dir1/CODEOWNERS': '../__mocks__/CODEOWNERS1',
  'dir2/CODEOWNERS': '../__mocks__/CODEOWNERS2',
  'dir2/dir3/CODEOWNERS': '../__mocks__/CODEOWNERS3',
  'node_modules/dir1/CODEOWNERS': '../__mocks__/CODEOWNERS5',
};

const withGitIgnore = { ...files, '.gitignore': '../__mocks__/gitIgnore1' };

describe('Generate', () => {
  let consoleWarnMock: jest.Mock;
  beforeAll(() => {
    consoleWarnMock = mockConsole('warn');
  });
  afterAll(() => {
    unMockConsole('warn');
  });

  beforeEach(() => {
    sync.mockRestore();
    stopAndPersist.mockClear();
    writeFile.mockClear();
    existsSync.mockRestore();
    search.mockRestore();
    fail.mockReset();
    consoleWarnMock.mockReset();
  });

  it('should generate a CODEOWNERS file (re-using codeowners content) and not fail when using --check option', async () => {
    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    const withPopulatedCodeownersFile = {
      ...withGitIgnore,
      CODEOWNERS: '../__mocks__/CODEOWNERS_POPULATED_OUTPUT_2',
    };
    existsSync.mockReturnValue(true);
    readFile.mockImplementation((file, callback): void => {
      const fullPath = path.join(
        __dirname,
        withPopulatedCodeownersFile[file as keyof typeof withPopulatedCodeownersFile]
      );
      const content = readFileSync(fullPath);
      callback(null, content);
    });

    await generateCommand(
      {
        output: 'CODEOWNERS',
        customRegenerationCommand: 'yarn codeowners-generator generate',
        check: true,
        preserveBlockPosition: true,
      },
      { parent: {} }
    );
  });
  it('should generate a CODEOWNERS file (re-using codeowners content) and fail when using --check option', async () => {
    const mockExit = mockProcessExit();

    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    const withPopulatedCodeownersFile = {
      ...withGitIgnore,
      CODEOWNERS: '../__mocks__/CODEOWNERS_POPULATED_OUTPUT',
    };
    existsSync.mockReturnValue(true);
    readFile.mockImplementation((file, callback): void => {
      const fullPath = path.join(
        __dirname,
        withPopulatedCodeownersFile[file as keyof typeof withPopulatedCodeownersFile]
      );
      const content = readFileSync(fullPath);
      callback(null, content);
    });

    await generateCommand(
      { output: 'CODEOWNERS', customRegenerationCommand: 'yarn codeowners-generator generate', check: true },
      { parent: {} }
    );

    expect(mockExit).toBeCalledWith(1);
  });

  it('should generate a CODEOWNERS file (re-using codeowners content)', async () => {
    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    const withPopulatedCodeownersFile = {
      ...withGitIgnore,
      CODEOWNERS: '../__mocks__/CODEOWNERS_POPULATED_OUTPUT',
    };
    existsSync.mockReturnValue(true);
    readFile.mockImplementation((file, callback): void => {
      const fullPath = path.join(
        __dirname,
        withPopulatedCodeownersFile[file as keyof typeof withPopulatedCodeownersFile]
      );
      const content = readFileSync(fullPath);
      callback(null, content);
    });

    await generateCommand(
      { output: 'CODEOWNERS', customRegenerationCommand: 'yarn codeowners-generator generate' },
      { parent: {} }
    );
    expect(writeFile.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "CODEOWNERS",
        "# We are already using CODEOWNERS and we don't want to lose the content of this file.
      scripts/ @myOrg/infraTeam
      # We might wanna keep an eye on something else, like yml files and workflows.
      .github/workflows/ @myOrg/infraTeam


      # Another line here that should be moved to after the generated block without preserve-block-position option enabled
      dir2/ @otherTeam

      #################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # To re-generate, run \`yarn codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/*.ts @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/README.md @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/README.md @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/dir3/*.ts @miny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.md @meeny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################",
      ]
    `);
  });

  it('should generate a CODEOWNERS file (re-using codeowners content, with preserve-block-position enabled)', async () => {
    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    const withPopulatedCodeownersFile = {
      ...withGitIgnore,
      CODEOWNERS: '../__mocks__/CODEOWNERS_POPULATED_OUTPUT',
    };
    existsSync.mockReturnValue(true);
    readFile.mockImplementation((file, callback): void => {
      const fullPath = path.join(
        __dirname,
        withPopulatedCodeownersFile[file as keyof typeof withPopulatedCodeownersFile]
      );
      const content = readFileSync(fullPath);
      callback(null, content);
    });

    await generateCommand(
      {
        output: 'CODEOWNERS',
        customRegenerationCommand: 'yarn codeowners-generator generate',
        preserveBlockPosition: true,
      },
      { parent: {} }
    );
    expect(writeFile.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "CODEOWNERS",
        "# We are already using CODEOWNERS and we don't want to lose the content of this file.
      scripts/ @myOrg/infraTeam
      # We might wanna keep an eye on something else, like yml files and workflows.
      .github/workflows/ @myOrg/infraTeam

      #################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # To re-generate, run \`yarn codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/*.ts @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/README.md @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/README.md @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/dir3/*.ts @miny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.md @meeny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################

      # Another line here that should be moved to after the generated block without preserve-block-position option enabled
      dir2/ @otherTeam",
      ]
    `);
  });
  it('should generate a CODEOWNERS FILE with groupSourceComments and customRegenerationCommand', async () => {
    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(path.join(__dirname, withGitIgnore[file as keyof typeof withGitIgnore]));
      callback(null, content);
    });

    await generateCommand(
      {
        output: 'CODEOWNERS',
        groupSourceComments: true,
        customRegenerationCommand: 'npm run codeowners-generator generate',
      },
      { parent: {} }
    );
    expect(writeFile.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "CODEOWNERS",
          "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # To re-generate, run \`npm run codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rules extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      /dir1/*.ts @miny
      /dir1/**/README.md @miny
      /dir1/README.md @moe
      # Rules extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      /dir2/dir3/*.ts @miny
      /dir2/**/*.md @meeny 
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################",
        ],
      ]
    `);
  });
  it('should generate a CODEOWNERS FILE', async () => {
    sync.mockReturnValueOnce(Object.keys(files));

    sync.mockReturnValueOnce(['.gitignore']);

    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(path.join(__dirname, withGitIgnore[file as keyof typeof withGitIgnore]));
      callback(null, content);
    });

    await generateCommand({ output: 'CODEOWNERS' }, { parent: {} });
    expect(writeFile.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "CODEOWNERS",
          "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # Don't worry, the content outside this block will be kept.

      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/*.ts @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/README.md @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/README.md @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/dir3/*.ts @miny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.md @meeny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################",
        ],
      ]
    `);
  });

  it('should generate a CODEOWNERS FILE with package.contributors and package.author field and removing package.json when a CODEOWNERS file exist at the same level', async () => {
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
      'dir1/package.json': '../__mocks__/package1.json',
      'dir2/dir1/package.json': '../__mocks__/package2.json',
      'dir6/package.json': '../__mocks__/package3.json',
      'dir7/package.json': '../__mocks__/package4.json',
      'dir8/package.json': '../__mocks__/package5.json',
    };

    sync.mockReturnValueOnce(Object.keys(packageFiles));

    sync.mockReturnValueOnce(['.gitignore']);
    const withAddedPackageFiles = { ...packageFiles, ...withGitIgnore };
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(
        path.join(__dirname, withAddedPackageFiles[file as keyof typeof withAddedPackageFiles])
      );
      callback(null, content);
    });

    await generateCommand({}, { parent: {} });
    expect(search).toHaveBeenCalled();

    expect(consoleWarnMock).toHaveBeenCalled();
    expect(consoleWarnMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "We will ignore the package.json dir1/package.json, given that we have encountered a CODEOWNERS file at the same dir level",
        ],
      ]
    `);
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # Don't worry, the content outside this block will be kept.

      # Rule extracted from dir2/dir1/package.json
      /dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir8/package.json
      /dir8/ gbuilder@builder.com other.friend@domain.com
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/*.ts @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/README.md @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/README.md @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/dir3/*.ts @miny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.md @meeny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################"
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
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(
        path.join(__dirname, withAddedPackageFiles[file as keyof typeof withAddedPackageFiles])
      );
      callback(null, content);
    });

    await generateCommand({}, { parent: {} });
    expect(search).toHaveBeenCalled();
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # Don't worry, the content outside this block will be kept.

      # Rule extracted from dir5/package.json
      /dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      /dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir8/package.json
      /dir8/ gbuilder@builder.com other.friend@domain.com
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/*.ts @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/README.md @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/README.md @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/dir3/*.ts @miny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.md @meeny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################"
    `);
  });
  it('should generate a CODEOWNERS FILE with package.maintainers field and groupSourceComments using cosmiconfig', async () => {
    search.mockImplementationOnce(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: {
          output: '.github/CODEOWNERS',
          useMaintainers: true,
          groupSourceComments: true,
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
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(
        path.join(__dirname, withAddedPackageFiles[file as keyof typeof withAddedPackageFiles])
      );
      callback(null, content);
    });

    await generateCommand({}, { parent: {} });
    expect(search).toHaveBeenCalled();
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # Don't worry, the content outside this block will be kept.

      # Rule extracted from dir5/package.json
      /dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      /dir2/dir1/ friend@example.com other@example.com
      # Rules extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      /dir1/*.ts @miny
      /dir1/**/README.md @miny
      /dir1/README.md @moe
      # Rules extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      /dir2/dir3/*.ts @miny
      /dir2/**/*.md @meeny 
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################"
    `);
  });
  it('should generate a CODEOWNERS FILE with package.maintainers field and customRegenerationCommand using cosmiconfig', async () => {
    search.mockImplementationOnce(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: {
          output: '.github/CODEOWNERS',
          useMaintainers: true,
          groupSourceComments: true,
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
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(
        path.join(__dirname, withAddedPackageFiles[file as keyof typeof withAddedPackageFiles])
      );
      callback(null, content);
    });

    await generateCommand({ customRegenerationCommand: 'npx codeowners-generator generate' }, { parent: {} });
    expect(search).toHaveBeenCalled();
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # To re-generate, run \`npx codeowners-generator generate\`. Don't worry, the content outside this block will be kept.

      # Rule extracted from dir5/package.json
      /dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      /dir2/dir1/ friend@example.com other@example.com
      # Rules extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      /dir1/*.ts @miny
      /dir1/**/README.md @miny
      /dir1/README.md @moe
      # Rules extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      /dir2/dir3/*.ts @miny
      /dir2/**/*.md @meeny 
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

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
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(
        path.join(__dirname, withAddedPackageFiles[file as keyof typeof withAddedPackageFiles])
      );
      callback(null, content);
    });

    await generateCommand({ output: 'CODEOWNERS', useMaintainers: true }, { parent: {} });
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # Don't worry, the content outside this block will be kept.

      # Rule extracted from dir5/package.json
      /dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      /dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir5/package.json
      /dir5/ friend@example.com other@example.com
      # Rule extracted from dir2/dir1/package.json
      /dir2/dir1/ friend@example.com other@example.com
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/*.ts @eeny @meeny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/*.ts @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/**/README.md @miny
      # Rule extracted from dir1/CODEOWNERS
      /dir1/README.md @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.ts @moe
      # Rule extracted from dir2/CODEOWNERS
      /dir2/dir3/*.ts @miny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/*.md @meeny
      # Rule extracted from dir2/CODEOWNERS
      /dir2/**/dir4/ @eeny
      # Rule extracted from dir2/dir3/CODEOWNERS
      /dir2/dir3/**/*.ts @miny

      #################################### Generated content - do not edit! ####################################"
    `);
  });
  it('should generate a CODEOWNERS FILE with package.maintainers field for root package.json', async () => {
    const packageFiles = {
      'package.json': '../__mocks__/package1.json',
      'dir2/package.json': '../__mocks__/package2.json',
    };

    sync.mockReturnValueOnce(['package.json', 'dir2/package.json']);

    sync.mockReturnValueOnce(['.gitignore']);
    const withAddedPackageFiles = { ...packageFiles, ...withGitIgnore };
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(
        path.join(__dirname, withAddedPackageFiles[file as keyof typeof withAddedPackageFiles])
      );
      callback(null, content);
    });

    await generateCommand({ output: 'CODEOWNERS', useMaintainers: true, useRootMaintainers: true }, { parent: {} });
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "#################################### Generated content - do not edit! ####################################
      # This block has been generated with codeowners-generator (for more information https://github.com/gagoar/codeowners-generator)
      # Don't worry, the content outside this block will be kept.

      # Rule extracted from package.json
      * friend@example.com other@example.com
      # Rule extracted from dir2/package.json
      /dir2/ friend@example.com other@example.com

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
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(path.join(__dirname, filesWithIgnore[file as keyof typeof filesWithIgnore]));
      callback(null, content);
    });

    const response = await generate({ rootDir: __dirname });
    expect(response).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "dir1/CODEOWNERS",
          "glob": "/dir1/**/*.ts",
          "owners": Array [
            "@eeny",
            "@meeny",
          ],
        },
        Object {
          "filePath": "dir1/CODEOWNERS",
          "glob": "/dir1/*.ts",
          "owners": Array [
            "@miny",
          ],
        },
        Object {
          "filePath": "dir1/CODEOWNERS",
          "glob": "/dir1/**/README.md",
          "owners": Array [
            "@miny",
          ],
        },
        Object {
          "filePath": "dir1/CODEOWNERS",
          "glob": "/dir1/README.md",
          "owners": Array [
            "@moe",
          ],
        },
        Object {
          "filePath": "dir2/CODEOWNERS",
          "glob": "/dir2/**/*.ts",
          "owners": Array [
            "@moe",
          ],
        },
        Object {
          "filePath": "dir2/CODEOWNERS",
          "glob": "/dir2/dir3/*.ts",
          "owners": Array [
            "@miny",
          ],
        },
        Object {
          "filePath": "dir2/CODEOWNERS",
          "glob": "/dir2/**/*.md",
          "owners": Array [
            "@meeny",
            "",
          ],
        },
        Object {
          "filePath": "dir2/CODEOWNERS",
          "glob": "/dir2/**/dir4/",
          "owners": Array [
            "@eeny",
          ],
        },
        Object {
          "filePath": "dir2/dir3/CODEOWNERS",
          "glob": "/dir2/dir3/**/*.ts",
          "owners": Array [
            "@miny",
          ],
        },
      ]
    `);
  });

  it('should not find any rules', async () => {
    sync.mockReturnValue([]);
    await generateCommand(
      {},
      {
        parent: {
          includes: ['**/NOT_STANDARD_CODEOWNERS'],
        },
      }
    );
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
    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(path.join(__dirname, filesWithIgnore[file as keyof typeof filesWithIgnore]));
      callback(null, content);
    });
    search.mockImplementationOnce(() => Promise.reject(new Error('some malformed configuration')));

    await generateCommand({}, { parent: {} });
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

    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(path.join(__dirname, files[file as keyof typeof files]));
      callback(null, content);
    });

    await generateCommand({}, { parent: {} });
    expect(writeFile).toHaveBeenCalled();
  });

  it('should blow up after finding malformed CODEOWNERS', async () => {
    const mockExit = mockProcessExit();
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

    readFile.mockImplementation((file, callback) => {
      const content = readFileSync(path.join(__dirname, addedMalformedFiles[file as keyof typeof addedMalformedFiles]));
      callback(null, content);
    });

    await generateCommand({ output: 'CODEOWNERS' }, { parent: {} });
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(fail.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "We encountered an error: *.ts in dir4/CODEOWNERS can not be parsed",
      ]
    `);
  });
});
