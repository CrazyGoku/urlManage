// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store';
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/index.css'
import ElementUI  from 'element-ui'
Vue.use(ElementUI)


axios.interceptors.request.use(function (config) {
  store.commit('SET_LOADING_ACTION',true)
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  if(response.data.code) store.commit('SET_LOADING_ACTION',false)

  return response;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});


Vue.prototype.$axios = axios

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
