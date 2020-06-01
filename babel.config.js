// 判断是生产阶段还是发布阶段
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  'presets': [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    // 通过展开运算符，插入要发布阶段的数组
    ...prodPlugins,
    //配置路由懒加载插件
    "@babel/plugin-syntax-dynamic-import"
  ]
}
