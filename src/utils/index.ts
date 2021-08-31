import { BigNumber } from 'ethers'

export const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

export const oneToken = BigNumber.from(1e18.toString())

export const toToken = (value: string) => {
	const n = BigNumber.from(value)
	if (n.lte(BigNumber.from('1'))) {
		return BigNumber.from((parseFloat(value) * 1e18).toString())
	}
	return n.mul(oneToken)
}

export const formatToken = (value: BigNumber, fixed = 6): string => {
	const max = BigNumber.from(Number.MIN_SAFE_INTEGER.toString())
	if (value.gt(max)) {
		return value.div(oneToken).toString()
	}
	const i = BigNumber.from(10 ** (18 - fixed))
	return (value.div(i).toNumber() / 10 ** (fixed)).toFixed(fixed)
}

export const defaultDeadline = () => {
	return BigNumber.from(Math.floor(Date.now() / 1000 + 100000))
}
