
import { ethers, Finding, getEthersProvider, HandleTransaction, TransactionEvent } from "forta-agent";
import LRU from "lru-cache";
import { UNISWAP_V3_FACTORY_ADDR, UNISWAP_V3_POOL_ABI } from "./constants";
import { uniswapPoolCache, isUniswapPool } from "./utils";
import { createFinding } from "./finding";

export function provideTransactionHandler(
  factoryAddress: string,
  provider: ethers.providers.Provider,
  uniswapPoolCache: LRU<string, boolean>
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];
    // filter for Swap events
    const swapEvents = txEvent.filterLog(UNISWAP_V3_POOL_ABI[0]);
    for (const swapEvent of swapEvents) {
      const pairAddress = swapEvent["address"];
      let isPool;

      try {
        const blockNumber = txEvent.blockNumber;
        isPool = await isUniswapPool(factoryAddress, provider, uniswapPoolCache, pairAddress, blockNumber);
      } catch (error) {
        return findings;
      }
      if (isPool) {
        swapEvents.forEach((transferEvent) => {
          const { sender, recipient, amount0, amount1 } = transferEvent.args;

          // create a finding for each swap event
          findings.push(createFinding(pairAddress, sender, recipient, amount0, amount1));
        });
      }
    }

    return findings;
  };
}

export default {

  handleTransaction: provideTransactionHandler(UNISWAP_V3_FACTORY_ADDR, getEthersProvider(), uniswapPoolCache),

};
