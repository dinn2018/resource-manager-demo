<template>
	<div style="width:100%;">
		<a-form
			:label-col="{ span: 1 }"
			:wrapper-col="{ span: 14 }"
		>
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

	async created() {
		const accounts = await getAccounts()
		this.buyer = accounts[0]
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
}
</script>
