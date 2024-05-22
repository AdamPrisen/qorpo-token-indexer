import {Store} from '@subsquid/typeorm-store'
import {Database} from '@subsquid/util-internal-processor-tools'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as erc20abi from '../abi/erc20'
import { EvmBatchProcessor } from '@subsquid/evm-processor';
import { BlockchainSymbol, TokenOwner } from '../model';
import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface Erc20Trasfer {
	from: string
	to: string
	value: bigint
	tokenAddress: string
	blockTimestamp: number
}

interface WalletResp {
	address: string
	user_id: string
}


export class MultichainProcessor {

	constructor(private blockchainSymbol: BlockchainSymbol,
		 		private relevantAddreses: Set<string>,
				private processor: EvmBatchProcessor
	) {}

	async process() {

		this.processor.run(new TypeormDatabase({supportHotBlocks: true, stateSchema: `${this.blockchainSymbol}_processor`}), async (ctx) => {
			const transfers: Erc20Trasfer[] = []
			const relevantOwners = new Set<string>()
			const updatedOwners = new Map<string, TokenOwner>()
			for (let c of ctx.blocks) {
				for (let log of c.logs) {
					if (!this.relevantAddreses.has(log.address) || log.topics[0] !== erc20abi.events.Transfer.topic) continue
					let {from, to, value} = erc20abi.events.Transfer.decode(log);
					relevantOwners.add(from);
					relevantOwners.add(to);
					transfers.push({from, to, value, tokenAddress: log.address, blockTimestamp: c.header.timestamp});
				}
			}

			const dbOwners = await ctx.store.find(TokenOwner, {where: {blockchainSymbol: this.blockchainSymbol,
				 ownerAddress: In(Array.from(relevantOwners)),
				 tokenAddress: In(Array.from(this.relevantAddreses))}});
			for (let owner of dbOwners) {
				updatedOwners.set(`${this.blockchainSymbol}-${owner.tokenAddress}-${owner.ownerAddress}`, owner);
			}

			const newOwners: TokenOwner[] = [];

			for (let transfer of transfers) {
				await this.updateOwner(updatedOwners, transfer.tokenAddress, transfer.from, -transfer.value, transfer.blockTimestamp, newOwners);
				await this.updateOwner(updatedOwners, transfer.tokenAddress, transfer.to, transfer.value, transfer.blockTimestamp, newOwners);
			}

			if (newOwners.length != 0){
				await this.updateUserIdsForNewOwners(newOwners, updatedOwners);
			}
			await ctx.store.upsert([...updatedOwners.values()]);
		})
	}

	async updateOwner(owners: Map<string, TokenOwner>, tokenAddress: string, ownerAddress: string, delta: bigint, blockTimestamp: number, newOwners: TokenOwner[]) {
		const ownerKey = `${this.blockchainSymbol}-${tokenAddress}-${ownerAddress}`;
		const owner = owners.get(ownerKey) || new TokenOwner();
		if (!owner.id) {
			owner.id = uuidv4();
			owner.blockchainSymbol = this.blockchainSymbol;
			owner.tokenAddress = tokenAddress;
			owner.ownerAddress = ownerAddress;
			owner.balance = delta;
			owner.lastUpdate = blockTimestamp/1000;
			owners.set(ownerKey, owner);
			newOwners.push(owner);
		} else{
			owner.balance += delta;
			owner.lastUpdate = blockTimestamp/1000;
			owners.set(ownerKey, owner);
		}
	}

	async updateUserIdsForNewOwners(newOwners: TokenOwner[], owners: Map<string, TokenOwner>) {
		const walletToTokenOwners = new Map<string, TokenOwner[]>();
		for (let owner of newOwners) {
			const owners = walletToTokenOwners.get(owner.ownerAddress);
			if (owners) {
				owners.push(owner);
			} else {
				walletToTokenOwners.set(owner.ownerAddress, [owner]);
			}
		}
		const walletsResp: WalletResp[] = await this.fetchWallets(Array.from(walletToTokenOwners.keys()));
		for (const walletResp of walletsResp) {
			const tokenOwners = walletToTokenOwners.get(walletResp.address);
			if (tokenOwners) {
				for (const tokenOwner of tokenOwners) {
					const key = `${this.blockchainSymbol}-${tokenOwner.tokenAddress}-${tokenOwner.ownerAddress}`;
					tokenOwner.userId = walletResp.user_id;
					owners.set(key, tokenOwner);
				}
			}
		}
	}

	async fetchWallets(wallet_addresses: string[]): Promise<WalletResp[]> {
		const response = await axios.post(`${process.env.WALLET_SERVICE_URL}/wallet/filter-wallets`, {wallet_addresses: wallet_addresses});
		if (response.status !== 200) {
			throw new Error(`Failed to get user ids for addresses`);
		}
		return response.data.wallets as WalletResp[];
	}
}




