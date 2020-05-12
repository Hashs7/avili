const ThreeMinifierResolver = require('@yushijinhun/three-minifier-webpack');

const threeMinifier = new ThreeMinifierResolver({/* options */});
module.exports = {
  devServer: {
    overlay: {
      warnings: false,
      errors: false
    }
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: `
          @import 
            "~@/styles/0-settings/_settings-color.scss",
            "~@/styles/0-settings/_settings-typography.scss",
            "~@/styles/0-settings/_settings-media.scss",
            "~@/styles/0-settings/_settings-fonts.scss";
          `,
      },
    }
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },
  configureWebpack: (config) => {
    config.devtool = 'source-map'
  },
  /*configureWebpack: {
    plugins: [
      threeMinifier,
    ]
  },
  resolveWebpackConfig: {
    plugins: [
      threeMinifier.resolver, // <=== (2) Add resolver on the FIRST line
    ]
  }*/
};