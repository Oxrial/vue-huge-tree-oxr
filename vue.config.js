module.exports = {
  pages: {
    index: {
      entry: './src/main.js',
      template: './public/index.html',
      filename: 'index.html'
    }
  },
  // 生产环境是否生成 sourceMap 文件，一般情况不建议打开
  productionSourceMap: false
};
