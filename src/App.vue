<template>
	<div id="app">
		<div style="width: 350px">
			<a-menu
				:default-selected-keys="['1']"
				:default-open-keys="['sub1']"
				mode="inline"
			>
				<a-menu-item key="0">
					<a-button
						v-if="!account"
						type="primary"
						@click="connect"
					>
						Connect
					</a-button>
					<div v-else>
						Connected: {{ formatAccount }}
					</div>
				</a-menu-item>
				<a-menu-item key="1">
					<span>Statistics</span>
					<router-link to="/" />
				</a-menu-item>
				<a-menu-item key="2">
					<span>Base Operation</span>
					<router-link to="/base-operation" />
				</a-menu-item>
				<a-menu-item key="3">
					<span>Storage Operation</span>
					<router-link to="/storage-operation" />
				</a-menu-item>
			</a-menu>
		</div>
		<keep-alive>
			<router-view style="margin:8px;" />
		</keep-alive>
	</div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { getAccounts } from '@/utils/eth'

@Component
export default class App extends Vue {
	index = 0
	account = ''

	created() {
		this.connect()
	}

	async connect() {
		const accounts = await getAccounts()
		this.account = accounts[0]
	}

	get formatAccount() {
		return (
			this.account.substr(0, 10) +
			'....' +
			this.account.substr(this.account.length - 8, 8)
		)
	}
}
</script>
<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
}
</style>
