import Vue from 'vue'
import App from './App.vue'
import RequireComponents from './components'
import './element-variables.scss'
Vue.use(RequireComponents)
Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')
