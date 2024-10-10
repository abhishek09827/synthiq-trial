export default {
    testEnvironment: 'node',
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'json'],
    setupFiles: ['<rootDir>/jest.setup.js'],
    modulePaths: [
      '../src',
      '../node_modules'
    ],
  };
  