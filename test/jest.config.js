/** @type {import('jest').Config} */
module.exports = {
  // Update the root directory if necessary
  rootDir: '../', // Set to the root of the project relative to the new location

  // Specify where tests are located
  testMatch: ['<rootDir>/test/**/*.test.ts'], // Adjust as needed for your project structure

  // Include TypeScript support
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Update coverage directories or patterns if required
  collectCoverageFrom: [
    '<rootDir>/lib/**/*.ts', // Include source files for coverage
    '!<rootDir>/lib/**/*.d.ts', // Exclude TypeScript declaration files
  ],

  // Add any other settings as needed
};

