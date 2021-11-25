import { providers } from 'ethers'
import { ResourceManager__factory } from './ResourceManager__factory'

const ResourceManagerAddress = '0xd92C9Bcf2FEABa73BD5A0BfD0d3C8C8605827F3A'
const provider = new providers.Web3Provider(window.ethereum as any)
const ResourceManager = ResourceManager__factory.connect(
	ResourceManagerAddress,
	provider
)

export {
	ResourceManagerAddress,
	ResourceManager,
	provider
}