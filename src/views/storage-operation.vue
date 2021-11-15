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
							<a-form-item label="To">
								<a-input v-model="to" />
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
					:columns="cidColumns"
					:data-source="cids"
					:pagination="false"
				/>
				<a-pagination
					v-model="page"
					show-less-items
					:total="totalCID"
					:page-size.sync="pageSize"
					@change="onPageChange"
				/>
				<a-table
					:columns="logColumns"
					:data-source="logData"
					:pagination="false"
				/>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Contract, utils, providers } from 'ethers'
import ResourceManager from '@/abi/ResourceManager.json'

interface PinLog {
	to: string
	cid: string
	cidKey: string
	operation: string
	size: number
}

interface CID {
	size: number
	cid: string
}

@Component
export default class StorageOperation extends Vue {
	pageSize = 10
	page = 1
	totalCID = 0
	cids: CID[] = []

	to = ''
	cid = ''
	size = 0
	txHash = ''
	proof = ''

	cidColumns = [
		{
			title: 'CID',
			dataIndex: 'data'
		},
		{
			title: 'Size',
			dataIndex: 'size',
			fixed: 'right'
		}
	]

	logColumns = [
		{
			title: 'to',
			dataIndex: 'to',
			fixed: 'left'
		},
		{
			title: 'Operation',
			dataIndex: 'operation'
		},
		{
			title: 'CIDKey',
			dataIndex: 'cidKey'
		},
		{
			title: 'CID',
			dataIndex: 'cid'
		},
		{
			title: 'Size',
			dataIndex: 'size',
			fixed: 'right'
		}
	]

	logData: PinLog[] = []

	resourceManagerInterface = new utils.Interface(ResourceManager.abi)
	resourceManagerContract = new Contract(
		ResourceManager.address,
		ResourceManager.abi
	)

	async created() {
		this.to = await this.getAccount()
		await this.refreshCIDs()
		await this.filterEvents()
		this.subscribePin()
	}

	async refreshCIDs() {
		await this.getCIDLength()
		await this.getCIDs()
	}

	async getCIDLength() {
		try {
			const total = await this.call(ResourceManager, 'cidLength', [this.to])
			this.totalCID = parseInt(total.toString())
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
			const ranged = await this.call(ResourceManager, 'getCIDs', [
				this.to,
				offset,
				limit
			])
			this.cids = ranged[0].map((v: any) => {
				return { size: v['size'].toNumber(), data: this.formatCID(v['data']) }
			})
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async pinAdd() {
		try {
			const buf = Buffer.from(this.cid)
			await this.sendTransaction(ResourceManager, 'pinAdd', [
				this.to,
				buf,
				this.size
			])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async pinRemove() {
		try {
			const buf = Buffer.from(this.cid)
			await this.sendTransaction(ResourceManager, 'pinRemove', [this.to, buf])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async subscribePin() {
		const provider = new providers.Web3Provider(window.ethereum as any)
		const filters = this.resourceManagerContract.filters.Pin()
		provider.on(filters, log => {
			this.addLog(log)
			this.refreshCIDs()
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
		this.logData.unshift({
			to: result['to'],
			cid: this.formatCID(result['cid']),
			cidKey: result['cidKey'],
			operation: this.formatOperation(result['operation']),
			size: result['size'].toString()
		})
	}

	onPageChange() {
		this.refreshCIDs()
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
