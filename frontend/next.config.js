const withPlugins = require('next-compose-plugins');
const typescript = require("@zeit/next-typescript");
const css = require("@zeit/next-css");
const graphql = require('next-plugin-graphql')

module.exports = withPlugins([typescript, css, graphql], {
  cssModules: true,
  sourceMap: true,
  cssLoaderOptions: {
    localIdentName: "[local]___[hash:base64:5]"
  }
});
