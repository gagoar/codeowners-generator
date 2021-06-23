process.env.TZ = 'UTC';

module.exports = {
  globals: {
    'ts-jest': {
      disableSourceMapSupport: true,
    },
  },
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testURL: 'http://localhost',
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  testMatch: ['**/*.(spec|test).{ts,tsx}'],
  collectCoverage: true,
  collectCoverageFrom: ['config/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '!src/utils/guards.ts', '!src/bin/cli.ts'],
  coverageDirectory: './coverage/',
};
