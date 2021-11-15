<template>
	<div id="app">
		<div style="width: 350px">
			<a-card>
				<a-button
					v-if="!isConnected"
					type="primary"
					@click="connect"
				>
					Connect
				</a-button>
				<div v-else>
					Connected: {{ formatAccount }} Network: {{ network }}
					<a-icon
						v-if="isNetworkSupported"
						style="color:green;"
						type="check-circle"
						theme="filled"
					/>
					<a-icon
						v-else
						style="color:red;"
						type="warning"
						theme="filled"
					/>
				</div>
			</a-card>
			<a-menu
				:default-selected-keys="['1']"
				:default-open-keys="['sub1']"
				mode="inline"
			>
				<a-menu-item key="1">
					<span>Statistics</span>
					<router-link to="/" />
				</a-menu-item>
				<a-menu-item key="2">
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
import { UPDATE_ACCOUNT, UPDATE_CHAINID } from '@/store'
import { formatNetwork, isNetworkSupported } from '@/utils'

@Component
export default class App extends Vue {
	created() {
		this.listen()
	}

	get isNetworkSupported() {
		return isNetworkSupported(this.$store.state.chainId)
	}

	get isConnected() {
		if (!window.ethereum) {
			return false
		}
		return !!this.$store.state.account
	}

	get network() {
		return formatNetwork(this.$store.state.chainId)
	}

	async connect() {
		if (!window.ethereum) {
			return this.$message.warn('Please install MetaMask to use this app.')
		}

		const isUnlocked = await window.ethereum._metamask.isUnlocked()
		if (!isUnlocked) {
			return this.$message.warn('Metamask has been locked, please unlock it.')
		}

		if (!isNetworkSupported(window.ethereum.chainId)) {
			return this.$message.error(
				'Please MetaMask change your network to `Mumbai`.'
			)
		}

		let accounts = await window.ethereum.request({
			method: 'eth_accounts'
		})
		if (accounts.length == 0) {
			accounts = await window.ethereum.request({
				method: 'eth_requestAccounts'
			})
		}

		this.$store.commit(UPDATE_ACCOUNT, accounts[0])
		this.$store.commit(UPDATE_CHAINID, window.ethereum.chainId)
	}

	listen() {
		window.ethereum.on('accountsChanged', accounts => {
			this.$store.commit(UPDATE_ACCOUNT, accounts[0])
		})

		window.ethereum.on('chainChanged', chainId => {
			this.$store.commit(UPDATE_CHAINID, chainId)
			if (isNetworkSupported(chainId)) {
				window.location.reload()
			}
		})
	}

	get formatAccount() {
		const account = this.$store.state.account
		if (account.length > 0) {
			return (
				account.substr(0, 10) + '....' + account.substr(account.length - 8, 8)
			)
		}
		return account
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
