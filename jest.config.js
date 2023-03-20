process.env.TZ = 'UTC';

module.exports = {
  verbose: true,
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  testMatch: ['**/*.(spec|test).{ts,tsx}'],
  collectCoverage: true,
  collectCoverageFrom: ['config/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '!src/utils/guards.ts', '!src/bin/cli.ts'],
  coverageDirectory: './coverage/',
};
