<template>
	<div style="width:100%;">
		<a-form>
			<a-form-item>
				<a-table
					:columns="columns"
					:data-source="accounts"
					:pagination="false"
				>
					<span
						slot="action"
						slot-scope="text, record"
					>
						<a-button
							type="primary"
							@click="addCID(record)"
						>Add CID</a-button>
						<a-button
							type="primary"
							@click="detail(record)"
						>Edit</a-button>
					</span>
				</a-table>
				<a-pagination
					v-model="page"
					show-less-items
					:total="totalAccounts"
					:page-size.sync="pageSize"
					@change="onPageChange"
				/>
			</a-form-item>
		</a-form>
		<CIDListModal
			:balance="selectedAccount"
			:show="showCIDListModal"
			@close="closeCIDListModal"
		/>
		<CIDAddModal
			:balance="selectedAccount"
			:show="showCIDAddModal"
			@close="closeCIDAddModal"
		/>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ResourceManager } from '@/factories'
import CIDListModal from '@/components/CIDListModal.vue'
import CIDAddModal from '@/components/CIDAddModal.vue'

@Component({
	components: {
		CIDListModal,
		CIDAddModal
	}
})
export default class Home extends Vue {
	pageSize = 10
	page = 1
	totalAccounts = 0
	accounts: Entity.Balance[] = []

	columns = [
		{
			title: 'Accounts',
			dataIndex: 'to',
			key: 'to'
		},
		{
			title: 'Total',
			dataIndex: 'total'
		},
		{
			title: 'Cost',
			dataIndex: 'cost'
		},
		{
			title: 'Expiration',
			dataIndex: 'expiration'
		},
		{
			title: 'Action',
			key: 'action',
			scopedSlots: { customRender: 'action' }
		}
	]

	selectedAccount: Entity.Balance = {
		to: '',
		total: '',
		cost: '',
		expiration: ''
	}
	showCIDListModal = false

	showCIDAddModal = false

	async created() {
		this.refresh()
	}

	async refresh() {
		await this.getAccountsLength()
		await this.getBalances()
	}

	async getAccountsLength() {
		const result = await ResourceManager.accountLength()
		this.totalAccounts = result.toNumber()
	}

	async getBalances() {
		const pageSize = this.pageSize
		const offset = (this.page - 1) * pageSize
		const limit =
			this.totalAccounts - offset > pageSize
				? pageSize
				: this.totalAccounts - offset
		try {
			const ranged = await ResourceManager.getBalances(offset, limit)
			this.accounts = ranged.map((r: any) => {
				return {
					to: r.to,
					cost: r.cost.toString(),
					total: r.total.toString(),
					expiration: new Date(r.expiration.toNumber() * 1000).toLocaleString()
				}
			})
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async onPageChange(i: number) {
		this.page = i
		this.refresh()
	}

	addCID(record: Entity.Balance) {
		this.selectedAccount = record
		this.showCIDAddModal = true
	}

	closeCIDAddModal() {
		this.showCIDAddModal = false
		this.refresh()
	}

	detail(record: Entity.Balance) {
		this.selectedAccount = record
		this.showCIDListModal = true
	}

	closeCIDListModal() {
		this.showCIDListModal = false
		this.refresh()
	}
}
</script>
