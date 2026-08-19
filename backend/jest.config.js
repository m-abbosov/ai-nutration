module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // oidc-provider ships pure ESM with no CJS build, which Jest's default
  // node_modules transform-ignore can't parse — see test-mocks/ for why.
  moduleNameMapper: {
    '^oidc-provider$': '<rootDir>/test-mocks/oidc-provider.mock.ts',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
