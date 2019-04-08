const withTypescript = require("@zeit/next-typescript");
const withCSS = require("@zeit/next-css");

module.exports = withTypescript(
  withCSS({
    cssModules: true,
    sourceMap: true,
    cssLoaderOptions: {
      localIdentName: "[local]___[hash:base64:5]"
    }
  })
);
