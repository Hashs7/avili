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
            "~@/styles/0-settings/_settings-media.scss";
          `,
        // font: `@import "~@/style/fonts.scss";`,
      },
    }
  },
};