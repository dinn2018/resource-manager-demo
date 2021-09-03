<template>
	<div style="width:100%;">
		<a-form>
			<a-form-item label="Pin">
				<a-card :bordered="true">
					<div
						class="calculation-card"
						style="height:330px;"
					>
						<a-form>
							<a-form-item label="Buyer">
								<a-input v-model="buyer" />
							</a-form-item>
							<a-form-item label="CID">
								<a-input v-model="cid" />
							</a-form-item>
							<a-form-item label="Size">
								<a-input v-model="size" />
							</a-form-item>
							<a-form-item>
								<a-button
									type="primary"
									html-type="submit"
									@click="pinAdd"
								>
									Pin Add
								</a-button>
								<a-button
									type="primary"
									style="margin-left:8px;"
									html-type="submit"
									@click="pinRemove"
								>
									Pin Remove
								</a-button>
							</a-form-item>
						</a-form>
					</div>
				</a-card>
				<a-table
					:columns="columns"
					:data-source="data"
				>
					<span
						slot="cid"
						slot-scope="cid"
						class="cid"
					>
						{{ formatCID(cid) }}
					</span>
					<span
						slot="operation"
						slot-scope="operation"
						class="operation"
					>
						{{ formatOperation(operation) }}
					</span>
				</a-table>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Contract, utils, providers } from 'ethers'

import Resources from '@/components/resources.vue'
import ResourceManager from '@/abi/ResourceManager.json'

interface PinLog {
	buyer: string
	cid: string
	cidKey: string
	operation: number
	size: number
}

@Component({
	components: {
		Resources
	}
})
export default class StorageOperation extends Vue {
	buyer = ''
	cid = ''
	size = 0
	txHash = ''
	proof = ''

	columns = [
		{
			title: 'Buyer',
			dataIndex: 'buyer',
			fixed: 'left'
		},
		{
			title: 'Operation',
			dataIndex: 'operation',
			scopedSlots: { customRender: 'operation' }
		},
		{
			title: 'CIDKey',
			dataIndex: 'cidKey'
		},
		{
			title: 'CID',
			dataIndex: 'cid',
			scopedSlots: { customRender: 'cid' }
		},
		{
			title: 'Size',
			dataIndex: 'size',
			fixed: 'right'
		}
	]

	data: PinLog[] = []

	resourceManagerInterface = new utils.Interface(ResourceManager.abi)
	resourceManagerContract = new Contract(
		ResourceManager.address,
		ResourceManager.abi
	)

	async created() {
		this.buyer = await this.getAccount()
		await this.filterEvents()
		this.subscribePin()
	}

	async pinAdd() {
		try {
			const buf = Buffer.from(this.cid)
			await this.sendTransaction(ResourceManager, 'pinAdd', [
				this.buyer,
				buf,
				this.size
			])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async subscribePin() {
		const provider = new providers.Web3Provider(window.ethereum as any)
		const filters = this.resourceManagerContract.filters.Pin()
		console.log('filters', filters)
		provider.on(filters, log => {
			this.addLog(log)
		})
	}

	async filterEvents() {
		const provider = new providers.Web3Provider(window.ethereum as any)

		const storageManager = new Contract(
			ResourceManager.address,
			ResourceManager.abi
		)
		const filters = storageManager.filters.Pin()
		const block = await provider.getBlock('latest')
		const logs = await provider.getLogs({
			...filters,
			fromBlock: block.number - 900,
			toBlock: block.number
		})
		logs.forEach(log => this.addLog(log))
	}

	addLog(log: providers.Log) {
		const result = this.resourceManagerInterface.decodeEventLog(
			'Pin',
			log.data,
			log.topics
		)
		console.log(result)
		this.data.unshift({
			buyer: result['buyer'],
			cid: result['cid'],
			cidKey: result['cidKey'],
			operation: result['operation'],
			size: result['size'].toString()
		})
	}

	async pinRemove() {
		try {
			const buf = Buffer.from(this.cid)
			await this.sendTransaction(ResourceManager, 'pinRemove', [
				this.buyer,
				buf
			])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	formatCID(cid: string) {
		const buf = Buffer.from(cid.substring(2), 'hex')
		return buf.toString()
	}

	formatOperation(op: number) {
		return op == 0 ? 'Add' : 'Remove'
	}
}
</script>
