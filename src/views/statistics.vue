<template>
	<div style="width:100%;">
		<a-form>
			<a-form-item label="Resource">
				<Resources @onResourceChanged="onResourceChanged" />
			</a-form-item>
			<a-form-item>
				<a-card :bordered="true">
					<div class="calculation-card">
						<div>storage balances total: {{ balances.total }}</div>
						<div>storage balances left: {{ balances.left }}</div>
						<div>
							storage balances deadline:
							{{ new Date(balances.deadline).toString() }}
						</div>
					</div>
				</a-card>
				<a-table
					:columns="accountsColumns"
					:data-source="accounts"
					:pagination="false"
				/>
				<a-pagination
					v-model="page"
					show-less-items
					:total="totalAccounts"
					:page-size.sync="pageSize"
					@change="onPageChange"
				/>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Resources, { StorageBalance } from '@/components/resources.vue'
import ResourceManager from '@/abi/ResourceManager.json'

@Component({
	components: {
		Resources
	}
})
export default class Statistics extends Vue {
	pageSize = 10
	page = 1
	totalAccounts = 0
	accounts: string[] = []

	accountsColumns = [
		{
			title: 'Accounts'
		}
	]

	resource: Deployment = { address: '', abi: [] }

	balances: StorageBalance = {
		total: 0,
		left: 0,
		deadline: 0
	}

	async created() {
		await this.getAccountsLength()
		await this.getAccounts()
	}

	async onResourceChanged(resource: Deployment) {
		this.resource = resource
		await this.getBalance()
	}

	async getBalance() {
		const account = await this.getAccount()
		const result = await this.call(ResourceManager, 'storageBalances', [
			account
		])
		this.balances = {
			total: result[0],
			left: result[1],
			deadline: result[2] * 1000
		}
	}

	async getAccountsLength() {
		const result = await this.call(ResourceManager, 'accountsLength')
		this.totalAccounts = parseInt(result[0].toString())
	}

	async getAccounts() {
		const pageSize = this.pageSize
		const offset = (this.page - 1) * pageSize
		const limit =
			this.totalAccounts - offset > pageSize
				? pageSize
				: this.totalAccounts - offset
		try {
			const ranged = await this.call(ResourceManager, 'getAccounts', [
				offset,
				limit
			])
			this.accounts = ranged
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	onPageChange() {
		this.getAccounts()
	}
}
</script>
