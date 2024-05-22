import { BlockchainSymbol } from '../model';
import { MultichainProcessor } from '../multichain/processor';
import { processor, ETH_QORPO_ADDRESS } from './processor';

const multichainProcessor = new MultichainProcessor(BlockchainSymbol.ETH, new Set([ETH_QORPO_ADDRESS]), processor);
(async () => {
	await multichainProcessor.process();
})();
