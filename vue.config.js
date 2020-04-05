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
        prependData: `@import "~@/styles/variables.scss";`,
        // font: `@import "~@/style/fonts.scss";`,
      },
    }
  },
};