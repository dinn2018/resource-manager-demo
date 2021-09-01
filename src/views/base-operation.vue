<template>
	<div style="width:100%;">
		<a-form>
			<a-form-item label="Resource">
				<Resources @onResourceChanged="onResourceChanged" />
			</a-form-item>
			<a-form-item label="Spend">
				<a-card :bordered="true">
					<div
						class="calculation-card"
						style="height:250px;"
					>
						<a-form>
							<a-form-item label="Buyer">
								<a-input v-model="buyer" />
							</a-form-item>
							<a-form-item label="Amount">
								<a-input v-model="amount" />
							</a-form-item>
							<a-form-item>
								<a-button
									type="primary"
									html-type="submit"
									@click="spend"
								>
									Spend
								</a-button>
								<a-button
									style="margin-left:8px;"
									type="primary"
									html-type="submit"
									@click="spendRollUp"
								>
									SpendRollUp
								</a-button>
							</a-form-item>
						</a-form>
					</div>
				</a-card>
			</a-form-item>
			<a-form-item label="Generate spend rollup message">
				<a-card :bordered="true">
					<div class="calculation-card">
						<a-form>
							<a-form-item label="SpendRollUp tx hash">
								<a-input v-model="txHash" />
							</a-form-item>
							<a-form-item>
								<a-button
									style="margin-left:8px;"
									type="primary"
									html-type="submit"
									@click="generate"
								>
									Generate
								</a-button>
							</a-form-item>
						</a-form>
					</div>
				</a-card>
				<a-card
					v-if="!!proof"
					style="word-break: break-all;"
				>
					{{ proof }}
				</a-card>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { MaticPOSClient } from '@maticnetwork/maticjs'
import { sendTransaction, Deployment, getAccounts } from '@/utils/eth'
import Resources from '@/components/resources.vue'
import ResourceManager from '@/abi/ResourceManager.json'

@Component({
	components: {
		Resources
	}
})
export default class BaseOperation extends Vue {
	resource: Deployment = { address: '', abi: [] }

	buyer = ''
	amount = '0'

	txHash = ''
	proof = ''

	async created() {
		const accounts = await getAccounts()
		this.buyer = accounts[0]
	}

	async onResourceChanged(resource: Deployment) {
		this.resource = resource
	}

	async spend() {
		try {
			await sendTransaction(ResourceManager, 'spend', [
				this.resource.address,
				this.buyer,
				this.amount
			])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async spendRollUp() {
		try {
			await sendTransaction(ResourceManager, 'spendRollUp', [
				this.resource.address,
				this.buyer
			])
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		}
	}

	async generate() {
		try {
			const maticPOSClient: any = new MaticPOSClient({
				maticProvider: 'https://rpc-mumbai.maticvigil.com', // replace if using mainnet
				parentProvider:
					'https://goerli.infura.io/v3/f4c7dab173b4418ba4838ffadc3bd904' // replace if using mainnet
			})
			const proof = await maticPOSClient.posRootChainManager.customPayload(
				this.txHash,
				'0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036' // SEND_MESSAGE_EVENT_SIG
			)
			this.proof = proof
		} catch (e) {
			this.$message.error(`generate proof failed: ${e}`)
		}
	}
}
</script>
