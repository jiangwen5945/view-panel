const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: 'localhost',
    port: 8999,
    open: true
  },
  chainWebpack: config => {
    config.plugin('html')
      .tap(args => {
        args[0].title = '电商平台实时监控系统'
        return args
      })
  }
})
