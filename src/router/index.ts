import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
Vue.use(VueRouter)

const routes: RouteConfig[] = [
	{
		path: '/',
		name: 'statistics',
		component: () => import('../views/statistics.vue'),
	},
	{
		path: '/storage-operation',
		name: 'storage-operation',
		component: () => import('../views/storage-operation.vue'),
	}
]

const router = new VueRouter({
	base: process.env.BASE_URL,
	routes,
})

export default router
