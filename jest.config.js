module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '/test/.*-test\\.ts$',
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: [ 'text', 'lcov' ],
  coveragePathIgnorePatterns: [
    '/bin/',
    '/node_modules/',
    '/test/',
  ]
};
