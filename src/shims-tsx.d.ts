import Vue, { VNode } from 'vue'

declare global {
	namespace JSX {
		// tslint:disable no-empty-interface
		interface Element extends VNode { }
		// tslint:disable no-empty-interface
		interface ElementClass extends Vue { }
		interface IntrinsicElements {
			[elem: string]: any
		}
	}
	interface Window {
		ethereum: {
			chainId: string,
			isConnected: () => boolean,
			enable: () => Promise<any>,
			isMetaMask: boolean,
			selectedAddress: string,
			request: (options: {
				method: 'eth_sendTransaction' | 'eth_call' | 'eth_requestAccounts' | 'eth_accounts' | 'eth_getBalance',
				params?: {
					from?: string
					to?: string
					gas?: string
					gasPrice?: string
					value?: string
					data?: string
				}[] | any[]
			}) => Promise<any>
		}
	}
}
