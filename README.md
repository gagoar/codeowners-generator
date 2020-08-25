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
     <a href="https://github.com/gagoar/use-herald-action">
        <img src="images/logo.png" alt="Logo" width="128" height="128">
    </a>
  </p>
  <p align="center">
    ✨ use codeowners anywhere in your monorepo 🛠️
    <br />
    <a href="https://github.com/gagoar/codeowners-generator#table-of-contents"><strong>Explore the docs »</strong></a>
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
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

[CODEOWNERS](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners) are automatically requested for review when someone opens a pull request that modifies code that they own. This is a great feature, but when working on monorepos ownership is shared between teams and it becomes difficult to maintain.

`codeowners-generator` allows you to position CODEOWNERS files anywhere in your project tree and it will take care of compiling all the files into a single generated file, that Github can understand. It also can read the maintainers fields (`contributors`, `author` and alternatively `maintainers`) in `package.json` (`useMaintainers` option in the cli ) making easy to keep CODEOWNERS and package.json in sync.

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
codeowners-generator generate --useMaintainers
```

### Specify CODEOWNERS (in case the CODEOWNERS files are named differently)

```sh
  codeowners-generator generate --includes '**/CODEOWNERS'
```

<!-- CONFIGURATION -->

## Configuration

You can configure `codeowners-generator` from several places:

### CLI options

- **includes** (`--includes`): The glob used to find CODEOWNERS files in the repo `default: ['**/CODEOWNERS', '!CODEOWNERS', '!node_modules']`

- **useMaintainers** (`--useMaintainers`): It will use `maintainers` field from package.json to generate codeowners, by default it will use `**/package.json`

for more details you can invoke:

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
    "useMaintainers": true
  },
  "scripts": {
    "codeowners": " codeowners-generator generate"
  },
  "devDependencies": {
    "codeowners-generator": "^1.0.0"
  }
}
```

When the command is invoked it will look for the `codeowners-generator` configuration block.

```bash
(my-package)$ npm run codeowners
```

Custom configuration can be defined in many places, for more information check [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

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
