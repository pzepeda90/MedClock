export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!node_modules/**'
  ],
  collectCoverage: false,
  clearMocks: true,
  restoreMocks: true,
  // setupFilesAfterEnv: ['./__tests__/setupTests.js'],
}; 