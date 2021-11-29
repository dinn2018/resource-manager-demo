<template>
	<div style="width: 700px">
		<a-modal
			v-model="visible"
			style="width: 700px"
			:ok-button-props="{ style: { display: 'none' } }"
			:cancel-button-props="{ style: { display: 'none' } }"
			@cancel="close"
		>
			<a-form>
				<a-form-item label="Size">
					<a-input v-model="size" />
				</a-form-item>
				<a-form-item>
					<a-button
						type="primary"
						html-type="submit"
						:loading="loading"
						@click="confirm"
					>
						Confirm
					</a-button>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import { ResourceManager, provider, ResourceManagerAddress } from '@/factories'

@Component
export default class CIDUpdateModal extends Vue {
	loading = false
	visible = false

	size = 0

	@Prop()
	cid!: Entity.CID

	@Prop()
	show = false

	@Watch('show')
	onShow(newValue: boolean) {
		this.visible = newValue
	}

	@Prop()
	balance!: Entity.Balance

	formatCID(cid: string) {
		const buf = Buffer.from(cid.substring(2), 'hex')
		return buf.toString()
	}

	async confirm() {
		try {
			this.loading = true
			const data = ResourceManager.interface.encodeFunctionData('update', [
				this.balance.to,
				this.cid.data,
				this.size
			])
			const signer = provider.getSigner()
			const from = await signer.getAddress()
			const tx = await signer.sendTransaction({
				from,
				to: ResourceManagerAddress,
				data
			})
			await tx.wait()
		} catch (e) {
			this.$message.error(JSON.stringify(e))
		} finally {
			this.loading = false
		}
	}

	@Emit()
	close() {}
}
</script>
