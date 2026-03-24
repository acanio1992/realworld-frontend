/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
module.exports = {
  testRunner: 'jest',
  // 'all' runs every file-covering test per mutant — avoids missed coverage on
  // module-level code (e.g. defaultState declarations) that 'perTest' can't attribute.
  coverageAnalysis: 'all',
  jest: {
    // Reuse our existing jest.config.js
    configFile: 'jest.config.js',
    // Don't collect coverage from stryker's instrumented code
    enableFindRelatedTests: true,
  },
  // Only mutate source files (not tests, not generated files)
  mutate: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorker.js',
    '!src/store.js',
    '!src/reducer.js',
    '!src/components/Settings.js',
    // actionTypes.js contains only string constants — mutations to string values
    // are undetectable without testing the literal strings (equivalent mutants).
    '!src/constants/actionTypes.js',
  ],
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: {
    fileName: 'reports/mutation/mutation.html',
  },
  thresholds: {
    high: 80,
    low: 60,
    break: null, // Don't fail CI on low score (experiment mode)
  },
  timeoutMS: 10000,
  timeoutFactor: 2.5,
  // Stryker will use babel via jest transform
  // No separate transpiler plugin needed
};
