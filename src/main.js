import Vue from 'vue';
import App from './App.vue';
import RequireComponents from './components';
import './element-variables.scss';
Vue.config.productionTip = false;

Vue.use(RequireComponents);
new Vue({
  render: h => h(App)
}).$mount('#app');
