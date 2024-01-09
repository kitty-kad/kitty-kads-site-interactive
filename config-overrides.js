module.exports = function override(config, env) {
  config.resolve.fallback = config.resolve.fallback ?? {};
  config.resolve.fallback.http = require.resolve("stream-http");
  config.resolve.fallback.https = require.resolve("https-browserify");
  return config;
};
