import { BlockchainSymbol } from '../model';
import { MultichainProcessor } from '../multichain/processor';
import { processor, BSC_QORPO_ADDRESS } from './processor';

const multichainProcessor = new MultichainProcessor(BlockchainSymbol.BNB, new Set([BSC_QORPO_ADDRESS]), processor);
(async () => {
	await multichainProcessor.process();
})();
