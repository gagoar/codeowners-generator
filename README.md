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
    <a href="https://codeclimate.com/github/gagoar/codeowners-generator/maintainability">
      <img src="https://api.codeclimate.com/v1/badges/9ab29ec3ef970bf219da/maintainability" />
    </a>
    <a href="https://github.com/gagoar/codeowners-generator/blob/master/LICENSE">
      <img src="https://img.shields.io/npm/l/codeowners-generator.svg?style=flat-square" alt="MIT license" />
    </a>
</p>

<p align="center">
  <a href="https://github.com/gagoar/codeowners-generator">
    <img src="images/logo.png" alt="Logo" width="128" height="128">
  </a>

  <h3 align="center">codeowners-generator</h3>

  <p align="center">
    ✨ A cli that makes using AWS Parameter Store... as simple as the flick of a wand 🧙
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
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

<p align="center">
  <a href="https://github.com/gagoar/codeowners-generator">
    <img src="images/cast.png" alt="cast spell">
  </a>
</p>

Many libraries deal with parameter store secrets. However, I didn't find one that suits my needs, so I created this one. I wanted to develop a library that will solve all my needs while using secrets, including exporting the key/secrets to different formats

Here's why:

- Many solutions require prefixes to store keys, making it difficult to migrate when needed.
- Support for exporting keys to widely accepted file formats such as JSON was limited.

### Built With

- [aws-sdk](https://github.com/aws/aws-sdk-js)
- [ora](https://github.com/sindresorhus/ora)
- [cli-table3](https://github.com/cli-table/cli-table3)
- [dateformat](https://github.com/felixge/node-dateformat)
- [commander](https://github.com/tj/commander.js/)
- [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

<!-- GETTING STARTED -->

## Getting Started

Below is an example of instructions you can integrate into your own project's _Getting Started_ section. You can follow these simple steps to get a local copy up and running:

### Prerequisites

- Node 8 or higher
- AWS credentials to your account. ([more info here](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html))

### Installation

If you wish to use `alohamora` as a standalone utility:

```sh
npm -g install codeowners-generator
```

This will make the `alo` command available in your terminal.

```sh
alo --help
```

If instead you would like to add it to a package:

```sh
npm install --only=dev codeowners-generator
```

<!-- USAGE EXAMPLES -->

## Usage

Every command accepts several options through command line or custom configuration [see configuration for more](#configuration)

### List secrets.

```sh
  alo list --prefix my-company/my-app
```

### Get a secret.

```sh
  alo get SECRET_KEY_NAME --prefix my-company/my-app
```

### Set/Update/Create a secret.

```sh
  alo set SECRET_KEY_NAME VALUE --prefix my-company/my-app --environment development
```

### Delete a secret.

```sh
  alo delete SECRET_KEY_NAME --prefix my-company/my-app --environment production
```

### Export secrets

```sh
  alo export json --prefix my-company/my-app --environment production
```

<!-- CONFIGURATION -->

## Configuration

You can configure `codeowners-generator` from several places:

### CLI options

- **Prefix** (`--prefix`): The prefix used to store the keys (it should not start or end with a `/`, ex: if the path to the secret is `/my-app/[env]/secretName`, the prefix will be `my-app` )

- **AWS region** (`--aws-region`): The AWS region code where the secrets will be stored (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions)', `default: us-east-1`

- **Environment** (`--environment`): It will be used to filter the secrets (production, staging, test, all), `default: all`

- **AWS Access Key ID** (`--aws-access-key-id`): Credentials following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html

- **AWS Secret Access Key** (`--aws-secret-access-key`): Credentials following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html

- **AWS Session Token** (`--aws-session-token`): Credentials following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html

- **AWS Profile** (`--aws-profile`): Following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html

- **CI flag** (`--ci`): Removes colors to avoid odd input. `default: false`

If you are using `alo` as a [global command](#installation), you can provide all the above options via command line:

```sh
  alo list --prefix my-company/my-app --aws-region us-west-2  --aws-profile myCustomAWSProfile --environment production
```

for more details you can invoke:

```sh
  alo --help
```

### Custom Configuration

You can also define custom configuration in your package:

```json
{
  "name": "my-package",
  "codeowners-generator": {
    "prefix": "my-company/my-app",
    "environment": "production",
    "region": "us-west-2"
  },
  "scripts": {
    "secrets": "alo export"
  },
  "devDependencies": {
    "codeowners-generator": "^1.0.0"
  }
}
```

When the command is invoked it will look for the `codeowners-generator` configuration block.

```bash
(my-package)$ npm run secrets
```

Custom configuration can be defined in many places, for more information check [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

**notes about custom configuration**

- If `prefix` is provided via cli, the custom configuration will be ignored.
- If configuration is provided via the cli, custom configuration will be merged with the provided cli configuration (except `prefix`)

example with overrides:

```json
"codeowners-generator": {
  "prefix": "my-company/my-app",
  "region": "us-west-2",
  "environment": "development",
}
```

```bash
  alo list --environment production
```

result: We will use everything from the custom configuration and use `environment` provided by the cli instead of the one on the custom configuration

example ignoring custom configuration:

```json
"codeowners-generator": {
  "prefix": "my-company/my-app",
  "region": "us-west-2",
  "environment": "development",
}
```

```bash
  alo list prefix "my-other-company/my-other-app"
```

result: We will ignore custom configuration given that `prefix` was provided via cli.

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

[contributors-shield]: https://img.shields.io/github/contributors/gagoar/codeowners-generator.svg?style=flat-square
[contributors-url]: https://github.com/gagoar/codeowners-generator/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/gagoar/codeowners-generator.svg?style=flat-square
[forks-url]: https://github.com/gagoar/codeowners-generator/network/members
[stars-shield]: https://img.shields.io/github/stars/gagoar/codeowners-generator.svg?style=flat-square
[stars-url]: https://github.com/gagoar/codeowners-generator/stargazers
[issues-shield]: https://img.shields.io/github/issues/gagoar/codeowners-generator.svg?style=flat-square
[issues-url]: https://github.com/gagoar/codeowners-generator/issues
[license-shield]: https://img.shields.io/github/license/gagoar/codeowners-generator.svg?style=flat-square
[license-url]: https://github.com/gagoar/codeowners-generator/blob/master/LICENSE
