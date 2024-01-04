<!-- PROJECT LOGO -->
<p align="center">
    <a href="https://www.npmjs.com/package/codeowners-generator">
      <img src="https://img.shields.io/npm/v/codeowners-generator/latest.svg?style=flat-square" alt="NPM Version" />
    </a>
    <a href="https://github.com/gagoar/codeowners-generator/actions">
      <img src="https://github.com/gagoar/codeowners-generator/workflows/codeowners-generator/badge.svg" alt="Workflow" />
    </a>
    <a href="https://codecov.io/gh/gagoar/codeowners-generator">
      <img src="https://codecov.io/gh/gagoar/codeowners-generator/branch/master/graph/badge.svg?token=48gHuQl8zV" alt="codecov" />
    </a>
    <a href="https://github.com/gagoar/codeowners-generator/blob/master/LICENSE">
      <img src="https://img.shields.io/npm/l/codeowners-generator.svg?style=flat-square" alt="MIT license" />
    </a>
</p>

<p align="center">

  <h3 align="center">codeowners-generator</h3>
  <p align="center">
     <a href="https://gagoar.github.io/codeowners-generator/">
        <img src="images/logo.png" alt="Logo" width="128" height="128">
    </a>
  </p>

  <p align="center">
    this project is sponsored by: <br>
    <a href="https://sourcegraph.com/">
       <img src="https://sourcegraph.com/.assets/img/sourcegraph-logo-light.svg" alt="SourceGraph" width="20%">
    </a>
  </p>
   
  <p align="center">
    ✨ use codeowners anywhere in your monorepo 🛠️
    <br />
    <a href="https://gagoar.github.io/codeowners-generator/"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://github.com/gagoar/codeowners-generator/issues">Report Bug</a>
    ·
    <a href="https://github.com/gagoar/codeowners-generator/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [About the Project](#about-the-project)
- [Built With](#built-with)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Action](#action)
- [Contributing](#contributing)
- [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

[CODEOWNERS](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners) are automatically requested for review when someone opens a pull request that modifies code that they own. This is a great feature, but when working on monorepos ownership is shared between teams and it becomes difficult to maintain.

`codeowners-generator` allows you to position CODEOWNERS files anywhere in your project tree and it will take care of compiling all the files into a single generated file, that Github can understand. It also can read the maintainers fields (`contributors`, `author` and alternatively `maintainers`) in `package.json` (`--use-maintainers` option in the cli ) making easy to keep CODEOWNERS and package.json in sync. Make sure the `author`/`contributors` syntax matches with `package.json` expected syntax from the [documentation](https://docs.npmjs.com/files/package.json#people-fields-author-contributors).

### Built With

- [ora](https://github.com/sindresorhus/ora)
- [commander](https://github.com/tj/commander.js/)
- [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

<!-- GETTING STARTED -->

### Installation

If you wish to use `codeowners-generator` as a standalone utility:

```sh
npm -g install codeowners-generator
```

This will make the `codeowners-generator` command available in your terminal.

```sh
codeowners-generator --help
```

If instead you would like to add it to a package:

```sh
npm install --only=dev codeowners-generator
```

<!-- USAGE EXAMPLES -->

## Usage

Every command accepts several options through command line or custom configuration [see configuration for more](#configuration)

### Generate CODEOWNERS file

```sh
  codeowners-generator generate
```

### Generate CODEOWNERS file (using `maintainers` field from `package.json`)

```sh
codeowners-generator generate --use-maintainers
```

### Specify CODEOWNERS (in case the CODEOWNERS files are named differently)

```sh
  codeowners-generator generate --includes '**/CODEOWNERS'
```

## Action

Now you can use `codeowners-generator` to validate if the CODEOWNERS file has been updated during a Pull Request.

```yml
name: Lint CODEOWNERS

on:
  pull_request:

jobs:
  codeowners:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2 # to checkout the code of the repo you want to check the CODEOWNERS from.
      - name: check codeowners
        uses: gagoar/codeowners-generator@master
        with:
          use-maintainers: true
          check: true
```

You can also use it to update the Pull Request. For that, you will need a GitHub App or Personal Token with the necessary permissions (code content). The code for that will look roughly like this:

```yml
name: update CODEOWNERS

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: gagoar/codeowners-generator@master
        with:
          use-maintainers: true
      - run: |
          STATUS=$(git diff --quiet && echo clean || echo modified)
          echo "status=$(echo $STATUS)" >> $GITHUB_OUTPUT
        id: gitStatus
      - run: |
          echo ${{ steps.gitStatus.outputs.status }}
          echo ${{ contains(steps.gitStatus.outputs.status, 'modified') }}
      - name: Commit CODEOWNERS
        if: contains(steps.gitStatus.outputs.status, 'modified')
        run: |
          set -x
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add CODEOWNERS
          git commit -m "update CODEOWNERS"
      - id: auth
        if: contains(steps.gitStatus.outputs.status, 'modified')
        uses: jnwng/github-app-installation-token-action@v2
        with:
          appId: ${{ secrets.YOUR_APP_ID }}
          installationId: ${{ secrets.YOUR_APP_INSTALLATION_ID }}
          privateKey: ${{ secrets.YOUR_APP_PRIVATE_KEY }}
      - name: Push changes
        if: contains(steps.gitStatus.outputs.status, 'modified')
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ steps.auth.outputs.token }}
          branch: ${{github.head_ref}}
```

<!-- CONFIGURATION -->

Remember that you can always create a configuration file in your project that will be picked up by the tool running on the action. For examples in how to configure take a look at the [configuration section below](#configuration).

## Configuration

You can configure `codeowners-generator` from several places:

### CLI options

- **includes** (`--includes`): The glob used to find CODEOWNERS files in the repo `default: ['**/CODEOWNERS', '!CODEOWNERS', '!.github/CODEOWNERS', '!docs/CODEOWNERS', '!node_modules']`

- **output** (`--output`): The output path and name of the file `default: CODEOWNERS`

- **useMaintainers** (`--use-maintainers`): It will use `maintainers` field from package.json to generate codeowners, by default it will use `**/package.json`

- **useRootMaintainers** (`--use-root-maintainers`): It will use `maintainers` field from the package.json in the root to generate default codeowners. Works only in conjunction with `useMaintainers`. `default: false`

- **groupSourceComments** (`--group-source-comments`): Instead of generating one comment per rule, enabling this flag will group them, reducing comments to one per source file. Useful if your codeowners file gets too noisy.

- **preserveBlockPosition** (`--preserve-block-position`): It will keep the generated block in the same position it was found in the CODEOWNERS file (if present). Useful for when you make manual additions.

- **customRegenerationCommand** (`--custom-regeneration-command`): Specify a custom regeneration command to be printed in the generated CODEOWNERS file, it should be mapped to run codeowners-generator (e.g. "npm run codeowners").

- **check** (`--check`): It will fail if the CODEOWNERS generated doesn't match the current (or missing) CODEOWNERS . Useful for validating that the CODEOWNERS file is not out of date during CI.

For more details you can invoke:

```sh
  codeowners-generator --help
```

### Custom Configuration

You can also define custom configuration in your package:

```json
{
  "name": "my-package",
  "codeowners-generator": {
    "includes": ["**/CODEOWNERS"],
    "output": ".github/CODEOWNERS",
    "useMaintainers": true,
    "useRootMaintainers": true,
    "groupSourceComments": true,
    "customRegenerationCommand": "npm run codeowners"
  },
  "scripts": {
    "codeowners": " codeowners-generator generate"
  },
  "devDependencies": {
    "codeowners-generator": "^2.0.0"
  }
}
```

When the command is invoked it will look for the `codeowners-generator` configuration block.

```bash
(my-package)$ npm run codeowners
```

If you create any files matching the following patterns, `codeowners-generator` will pick them up:

- a `codowners-generator` property in package.json
- a `.codowners-generatorrc` file in JSON or YAML format
- a `.codowners-generator.json`, `.codowners-generator.yaml`, `.codowners-generator.yml`, `.codowners-generator.js`, or `.codowners-generator.cjs` file
- a `codowners-generatorrc`, `codowners-generator.json`, `codowners-generatorrc.yaml`, `codowners-generatorrc.yml`, `codowners-generator.js` or `codowners-generator.cjs` file inside a .config subdirectory
- a `codowners-generator.config.js` or `codowners-generator.config.cjs` CommonJS module exporting an object

For more insight into the custom configuration and where it can be defined check [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/gagoar/codeowners-generator/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what makes the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

<p align="center">
  <a href="https://linkedin.com/in/gagoar">
      <img src="https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555" alt="follow on Twitter">
  </a>
    <a href="https://twitter.com/intent/follow?screen_name=gagoar">
      <img src="https://img.shields.io/twitter/follow/gagoar?style=social&logo=twitter" alt="follow on Twitter">
  </a>
</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
