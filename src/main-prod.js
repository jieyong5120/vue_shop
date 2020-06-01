import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 通过外部的cdn导入elementui可以依赖项
// import './plugins/element.js'
// 引入全局样式
import './assets/css/global.css'
// 引入字体图标的样式
import './assets/fonts/iconfont.css'
// 引入第三方树桩结构依赖
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器的样式
// css样式太大，通过外部本地导入
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

// 导入进度条nprogress的js文件
import NProgress from 'nprogress'
// 导入nprogress的css文件
// css样式太大，通过外部本地导入
// import 'nprogress/nprogress.css'

import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在resquest拦截器里面展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器里面隐藏进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 第三方树桩结构依赖全局挂载
Vue.component('tree-table', TreeTable)
// 将富文本编辑器，注册为全局组件
Vue.use(VueQuillEditor)

// 在全局里面挂载一个过滤器，在list里面使用了
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const yyyy = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${yyyy}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
