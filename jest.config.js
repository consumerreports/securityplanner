module.exports = {
  globals: {
    "__SPACE_ID__" : "ta4xc5av592v",
    "__DELIVERY_KEY__" : "c2a21ef1c90c40593f8a39fbf986c2cd3cff339fac21a4e04f66e3d7011abe1d",
    "__PREVIEW_KEY__" : "5d9f6f7bfc0f438d5bd9e24c699b7bb84631aa1894b26d1c07a5b43ca225f19e"
  },
  setupFiles: ['<rootDir>/test/test-setup.js'],
  collectCoverageFrom: [
    '**/src/js/components/**/*.js',
    '**/src/js/components/**/**/*.js',
    '**/src/js/stores/**/*.js',
    '!**/src/js/components/debug/**',
    '!**/src/js/components/pages/preview/**',
    '!**/src/js/components/pages/cover/SponsorsBanner.react.js',
  ],
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test/mocks/fileMock.js",
    "\\.(css|less)$": "<rootDir>/test/mocks/styleMock.js"
  },
  modulePaths: ['<rootDir>/src', '<rootDir>/test'],
  verbose: false,
  "reporters": [
    "default",
    ["./node_modules/jest-html-reporter", {
      "pageTitle": "Test Report for Security Planner",
      "outputPath": "test-report/index.html",
      "includeFailureMsg": true,
      "includeConsoleLog": true
    }]
  ]
}