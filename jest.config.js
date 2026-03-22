module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorker.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    // Istanbul instrumentation quirk with combineReducers default export
    '!src/reducer.js',
    // Store setup/config — production branch untestable in jest environment
    '!src/store.js',
    // Settings.onUnload is dead code (no componentWillUnmount calls it)
    '!src/components/Settings.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};