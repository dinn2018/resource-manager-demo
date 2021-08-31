import { utils } from 'ethers'

export interface Deployment {
	address: string,
	abi: any[]
}

export interface CallOption {
	from?: string,
	to?: string,
	value?: string,
	gas?: string,
	gasPrice?: string
}

export const call = async (
	deployment: Deployment,
	functionName: string,
	args?: any[],
	options?: CallOption
) => {
	const accounts = await getAccounts()
	const contractInterface = new utils.Interface(deployment.abi)
	const data = contractInterface.encodeFunctionData(functionName, args)
	const result = await window.ethereum.request({
		method: 'eth_call',
		params: [
			{
				from: options?.from || accounts[0],
				to: options?.to || deployment.address,
				data,
				value: options?.value,
				gas: options?.gas,
				gasPrice: options?.gasPrice
			}
		]
	})
	return contractInterface.decodeFunctionResult(functionName, result)
}

export const sendTransaction = async (
	deployment: Deployment,
	functionName: string,
	args?: any[],
	options?: CallOption
) => {
	const accounts = await getAccounts()
	const contractInterface = new utils.Interface(deployment.abi)
	const data = contractInterface.encodeFunctionData(functionName, args)
	return window.ethereum.request({
		method: 'eth_sendTransaction',
		params: [
			{
				from: options?.from || accounts[0],
				to: options?.to || deployment.address,
				data,
				value: options?.value,
				gas: options?.gas,
				gasPrice: options?.gasPrice
			}
		]
	})

}

export const getBalance = async (options?: CallOption) => {
	const accounts = await getAccounts()

	return window.ethereum.request({
		method: 'eth_getBalance',
		params: [
			options?.from || accounts[0],
		]
	})
}

export const getAccounts = async (): Promise<string[]> => {
	let accounts = await window.ethereum.request({
		method: 'eth_accounts'
	})
	if (accounts.length == 0) {
		accounts = await window.ethereum.request({
			method: 'eth_requestAccounts'
		})
	}
	return accounts
}