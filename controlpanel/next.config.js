require('dotenv').config();
const withCss = require('@zeit/next-css');

// const { LANG, GRAPHQL_ENDPOINT, DEBUG, BUNDLE_ANALYZE } = process.env;

module.exports = withCss({
  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'static',
      reportFilename: '../.next/server.html'
    },
    browser: {
      analyzerMode: 'static',
      reportFilename: '../.next/client.html'
    }
  },
  // process.env: {
  //   // Will be available on both server and client
  //   LANG,
  //   GRAPHQL_ENDPOINT,
  //   DEBUG
  // },
  env: {
    LANG: process.env.LANG,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
    DEBUG: process.env.DEBUG
  },
  webpack(config) {
    const newConfig = config;
    newConfig.module.rules.push({
      test: /\.(png|svg|eot|otf|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          publicPath: './',
          outputPath: 'static/',
          name: '[name].[ext]'
        }
      }
    });
    return newConfig;
  }
});
