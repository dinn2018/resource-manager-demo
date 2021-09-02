<template>
	<a-select
		default-value="0"
		@change="onResourceChanged"
	>
		<a-select-option
			v-for="(resource, i) of resources"
			:key="`${i}-${resource.deployment.address}`"
			:value="`${i}`"
		>
			{{ resource.name }} {{ resource.deployment.address }}
		</a-select-option>
	</a-select>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import StorageWithDeadline from '@/abi/StorageWithDeadline.json'
import SimpleResourceERC20 from '@/abi/SimpleResourceERC20.json'
import SimpleResourceETH from '@/abi/SimpleResourceETH.json'

export interface StorageBalance {
	total: number
	left: number
	deadline: number
}

@Component
export default class Resources extends Vue {
	resources = [
		{
			name: 'StorageWithDeadline',
			deployment: StorageWithDeadline
		},
		{
			name: 'SimpleResourceERC20',
			deployment: SimpleResourceERC20
		},
		{
			name: 'SimpleResourceETH',
			deployment: SimpleResourceETH
		}
	]

	async created() {
		this.$emit('onResourceChanged', this.resources[0].deployment)
	}

	async onResourceChanged(index: number) {
		this.$emit('onResourceChanged', this.resources[index].deployment)
	}
}
</script>
