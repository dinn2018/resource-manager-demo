import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import '@/style/index.css'
import { message } from 'ant-design-vue'

Vue.use(Antd)
Vue.prototype.$message = message
message.config({
	duration: 5,
})

Vue.config.productionTip = false

new Vue({
	router,
	render: (h) => h(App),
}).$mount('#app')
