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
							<a-form-item label="Deadline">
								<a-date-picker
									:disabled-date="disabledDate"
									placeholder="Select date"
									@change="deadlineChanged"
								/>
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
import { sendTransaction, getAccounts } from '@/utils/eth'
import { Contract, utils, providers } from 'ethers'

import Resources from '@/components/resources.vue'
import StorageManager from '@/abi/StorageManager.json'
import moment from 'moment'

interface PinLog {
	buyer: string
	cid: string
	cidKey: string
	operation: number
}
@Component({
	components: {
		Resources
	}
})
export default class StorageOperation extends Vue {
	buyer = ''
	cid = ''
	deadline = 0

	txHash = ''
	proof = ''

	columns = [
		{
			title: 'Buyer',
			dataIndex: 'buyer',
			fixed: 'left'
		},
		{
			title: 'CID',
			dataIndex: 'cid',
			scopedSlots: { customRender: 'cid' }
		},
		{
			title: 'CIDKey',
			dataIndex: 'cidKey'
		},
		{
			title: 'Operation',
			dataIndex: 'operation',
			fixed: 'right',
			scopedSlots: { customRender: 'operation' }
		}
	]

	data: PinLog[] = []

	async created() {
		const accounts = await getAccounts()
		this.buyer = accounts[0]
		await this.filterEvents()
		this.subscribePin()
	}

	async pinAdd() {
		try {
			const buf = Buffer.from(this.cid)
			await sendTransaction(StorageManager, 'pinAdd', [
				this.buyer,
				buf,
				this.deadline
			])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async subscribePin() {
		const provider = new providers.Web3Provider(window.ethereum as any)
		const storageManager = new Contract(
			StorageManager.address,
			StorageManager.abi
		)
		const filters = storageManager.filters.Pin()
		const storageInterface = new utils.Interface(StorageManager.abi)

		provider.on(filters, log => {
			const result = storageInterface.decodeEventLog(
				'Pin',
				log.data,
				log.topics
			)
			this.data.unshift({
				buyer: result['buyer'],
				cid: result['cid'],
				cidKey: result['cidKey'],
				operation: result['operation']
			})
		})
	}

	async filterEvents() {
		const provider = new providers.Web3Provider(window.ethereum as any)

		const storageManager = new Contract(
			StorageManager.address,
			StorageManager.abi
		)
		const filters = storageManager.filters.Pin()
		const block = await provider.getBlock('latest')
		const logs = await provider.getLogs({
			...filters,
			fromBlock: block.number - 900,
			toBlock: block.number
		})
		const storageInterface = new utils.Interface(StorageManager.abi)

		for (let log of logs) {
			const result = storageInterface.decodeEventLog(
				'Pin',
				log.data,
				log.topics
			)
			this.data.unshift({
				buyer: result['buyer'],
				cid: result['cid'],
				cidKey: result['cidKey'],
				operation: result['operation']
			})
		}
	}

	async pinRemove() {
		try {
			const buf = Buffer.from(this.cid)
			await sendTransaction(StorageManager, 'pinRemove', [this.buyer, buf])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	deadlineChanged(date: moment.Moment) {
		this.deadline = date.unix()
	}

	disabledDate(current: moment.Moment) {
		return current && current < moment().endOf('day')
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
