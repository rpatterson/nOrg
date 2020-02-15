/* eslint-disable import/no-extraneous-dependencies */
const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        // runs all files ending with .test in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm run test -- --grep test/foo/bar.test.js
        // npm run test -- --grep test/bar/*
        {
          pattern: config.grep ? config.grep : 'components/*/test/**/*.test.js',
          type: 'module',
        },
        {
          pattern: config.grep ? config.grep : 'src/**/test/**/*.test.js',
          type: 'module',
        },
      ],

      esm: {
        nodeResolve: true,
        coverageExclude: ['context.html'],
      },
      // you can overwrite/extend the config further

      coverageIstanbulReporter: {
        reports: ['text'],
        thresholds: {
          global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
          },
        },
      },
    }),
  );
  return config;
};
