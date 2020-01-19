require('dotenv').config();
const withPlugins = require('next-compose-plugins');
const css = require('@zeit/next-css');
const graphql = require('next-plugin-graphql');

module.exports = withPlugins([css, graphql], {
  cssModules: true,
  sourceMap: true,
  cssLoaderOptions: {
    localIdentName: '[local]___[hash:base64:5]'
  },
  env: {
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT
  }
  // publicRuntimeConfig: {
  //   GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT
  // }
});
