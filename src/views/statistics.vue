<template>
	<div style="width:100%;">
		<a-form
			:label-col="{ span: 5 }"
			:wrapper-col="{ span: 12 }"
		>
			<a-form-item label="Resource">
				<Resources @onResourceChanged="onResourceChanged" />
			</a-form-item>
			<a-form-item :wrapper-col="{ span: 12, offset: 5 }">
				<a-card :bordered="true">
					<div class="calculation-card">
						<div>Resource balances total: {{ balances.total }}</div>
						<div>Resource balances left: {{ balances.left }}</div>
						<div>Resource balances spent: {{ balances.spent }}</div>
					</div>
				</a-card>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { call, Deployment, getAccounts } from '@/utils/eth'
import Resources, { ResourceBalance } from '@/components/resources.vue'
import ResourceManager from '@/abi/ResourceManager.json'

@Component({
	components: {
		Resources
	}
})
export default class Statistics extends Vue {
	resource: Deployment = { address: '', abi: [] }

	balances: ResourceBalance = {
		total: 0,
		left: 0,
		spent: 0
	}

	async onResourceChanged(resource: Deployment) {
		this.resource = resource
		await this.getBalance()
	}

	async getBalance() {
		const accounts = await getAccounts()
		const result = await call(ResourceManager, 'balances', [
			this.resource.address,
			accounts[0]
		])
		this.balances = {
			total: result[0].toString(),
			left: result[1].toString(),
			spent: result[2].toString()
		}
	}
}
</script>
