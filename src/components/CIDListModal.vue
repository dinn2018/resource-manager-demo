<template>
	<div style="width: 100%">
		<a-modal
			v-model="visible"
			width="1000px"
			:ok-button-props="{ style: { display: 'none' } }"
			:cancel-button-props="{ style: { display: 'none' } }"
			@cancel="close"
		>
			<a-form>
				<a-table
					:columns="cidColumns"
					:data-source="cids"
					:pagination="false"
					:scroll="{ x: 800 }"
				>
					<span
						slot="data"
						slot-scope="text, record"
					>{{
						formatCID(record.data)
					}}</span>
					<span
						slot="action"
						slot-scope="text, record"
					>
						<a-button
							type="primary"
							:loading="removeLoading && opCID.data == record.data"
							@click="removeCID(record)"
						>Remove</a-button>
						<a-button
							type="primary"
							:loading="updateLoading && opCID.data == record.data"
							@click="updateCID(record)"
						>Update</a-button>
					</span>
				</a-table>
				<a-pagination
					v-model="page"
					show-less-items
					:total="totalCID"
					:page-size.sync="pageSize"
					@change="onPageChange"
				/>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import { ResourceManager, provider, ResourceManagerAddress } from '@/factories'
import { BigNumber } from 'ethers'

@Component
export default class CIDListModal extends Vue {
	visible = false

	removeLoading = false
	updateLoading = false

	@Prop()
	show = false

	@Watch('show')
	onShow(newValue: boolean) {
		this.visible = newValue
		this.refreshCIDs()
	}

	@Prop()
	balance!: Entity.Balance

	pageSize = 10
	page = 1
	totalCID = 0
	cids: Entity.CID[] = []

	cost: BigNumber = BigNumber.from('0')

	cidColumns = [
		{
			title: 'CID',
			dataIndex: 'data',
			width: 400,
			scopedSlots: { customRender: 'data' }
		},
		{
			title: 'Size',
			dataIndex: 'size',
			width: 100
		},
		{
			title: 'Action',
			key: 'action',
			fixed: 'right',
			width: 300,
			scopedSlots: { customRender: 'action' }
		}
	]

	opCID: Entity.CID = { size: 0, data: '' }

	@Watch('balance')
	onBalanceChanged(newValue: boolean) {
		this.refreshCIDs()
	}

	onPageChange() {
		this.refreshCIDs()
	}

	formatCID(cid: string) {
		const buf = Buffer.from(cid.substring(2), 'hex')
		return buf.toString()
	}

	async removeCID(record: Entity.CID) {
		try {
			this.opCID = record
			this.removeLoading = true
			const data = ResourceManager.interface.encodeFunctionData('remove', [
				this.balance.to,
				record.data
			])
			const signer = provider.getSigner()
			const from = await signer.getAddress()
			const tx = await signer.sendTransaction({
				from,
				to: ResourceManagerAddress,
				data
			})
			await tx.wait()
			await this.refreshCIDs()
		} catch (e) {
			this.popError(e)
		} finally {
			this.removeLoading = false
		}
	}

	async updateCID(record: Entity.CID) {
		try {
			this.opCID = record
			this.updateLoading = true
			const data = ResourceManager.interface.encodeFunctionData('update', [
				this.balance.to,
				record.data,
				1000
			])
			const signer = provider.getSigner()
			const from = await signer.getAddress()
			const tx = await signer.sendTransaction({
				from,
				to: ResourceManagerAddress,
				data
			})
			await tx.wait()
			await this.refreshCIDs()
		} catch (e) {
			this.popError(e)
		} finally {
			this.updateLoading = false
		}
	}

	async refreshCIDs() {
		await this.getCIDLength()
		await this.getCIDs()
	}

	async getCIDLength() {
		try {
			const total = await ResourceManager.cidLength(this.balance.to)
			this.totalCID = total.toNumber()
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async getCIDs() {
		const pageSize = this.pageSize
		const offset = (this.page - 1) * pageSize
		const limit =
			this.totalCID - offset > pageSize ? pageSize : this.totalCID - offset
		try {
			const cids = await ResourceManager.getCIDs(this.balance.to, offset, limit)
			this.cids = cids.map(v => {
				return { size: v.size.toNumber(), data: v.data }
			})
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	@Emit()
	close() {}
}
</script>
