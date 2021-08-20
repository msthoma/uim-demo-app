/* config-overrides.js */

const rewireProvidePlugin = require('react-app-rewire-provide-plugin');
const rewireDefinePlugin = require('@yeutech-lab/react-app-rewire-define-plugin');

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  if (!config.externals) {
    config.externals = [];
  }

  if (!config.plugins) {
    config.plugins = [];
  }

  config.externals = [...config.externals, 'bindings', 'canvas', 'gl', 'systeminformation'];

  config = rewireProvidePlugin(config, env, {
    // expose some of public dependencies - these ones which do not provides ECMA 6 exports
    ClipperLib: 'clipper-lib',
    poly2tri: 'poly2tri',
    protobuf: 'protobufjs',
    Long: 'long',
    md5: 'js-md5',
  });

  config = rewireDefinePlugin(config, env, {
    DIGITAL_INK_ENV: '"BROWSER"',
  });

  return config;
};
