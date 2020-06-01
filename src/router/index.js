import Vue from 'vue'
import VueRouter from 'vue-router'
// 被注释的旧的方式
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName:"users_roles_rights" */ '../components/user/Users.vue')
// import Roles from '../components/roles/Roles.vue'
const Roles = () => import(/* webpackChunkName:"users_roles_rights" */ '../components/roles/Roles.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName:"users_roles_rights" */ '../components/power/Rights.vue')

// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName:"cate_params" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName:"cate_params" */ '../components/goods/Params.vue')

// import List from '../components/goods/List.vue'
const List = () => import(/* webpackChunkName:"list_add" */ '../components/goods/List.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName:"list_add" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName:"order_report" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName:"order_report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      redirect: '/welcome',
      component: Home,
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/roles', component: Roles },
        { path: '/rights', component: Rights },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
