import { ethers, Finding, getEthersProvider, HandleTransaction, TransactionEvent } from "forta-agent";
import { FindingSeverity, FindingType } from "forta-agent";
import LRU from "lru-cache";
import { UNISWAP_V3_FACTORY_ADDR, UNISWAP_V3_POOL_ADDR } from "./constants";

import { computePoolAddress, uniswapPoolCache } from "./utils";

type CacheValue = boolean;

const isUniswapPool = async (
  factoryAddress: string,
  provider: ethers.providers.Provider,
  poolCache: LRU<string, CacheValue>,
  pairAddress: string,
  block: number
): Promise<boolean> => {
  if (poolCache.has(pairAddress)) return poolCache.get(pairAddress) as unknown as Promise<boolean>;
  const poolContract = new ethers.Contract(pairAddress, UNISWAP_V3_POOL_ADDR, provider);
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0({ blockTag: block }),
    poolContract.token1({ blockTag: block }),
    poolContract.fee({ blockTag: block }),
  ]);
  const poolAddress = computePoolAddress(factoryAddress, token0, token1, fee.toString());

  const result = poolAddress.toLowerCase() === pairAddress.toLowerCase();
  poolCache.set(pairAddress, result);

  return result;
};

export function provideTransactionHandler(
  factoryAddress: string,
  provider: ethers.providers.Provider,
  uniswapPoolCache: LRU<string, boolean>
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];
    // filter for Swap events
    const swapEvents = txEvent.filterLog(UNISWAP_V3_POOL_ADDR[0]);
    for (const swapEvent of swapEvents) {
      const pairAddress = swapEvent["address"];
      let isPool;

      try {
        const block = txEvent.blockNumber;
        isPool = await isUniswapPool(factoryAddress, provider, uniswapPoolCache, pairAddress, block);
      } catch (error) {
        return [];
      }
      if (isPool) {
        swapEvents.forEach((transferEvent) => {
          const { sender, recipient, amount0, amount1 } = transferEvent.args;

          // create a finding for each swap event
          findings.push(
            Finding.fromObject({
              name: "Uniswap V3 Swap Event",
              description: `swap event detected in uniswap v3`,
              alertId: "UNISWAP-V3-SWAP-EVENT",
              severity: FindingSeverity.Info,
              type: FindingType.Info,
              protocol: "Uniswap",
              metadata: {
                poolAddress: pairAddress,
                sender,
                recipient,
                amount0: amount0.toString(),
                amount1: amount1.toString(),
              },
            })
          );
        });
      }
    }
    return findings;
  };
}

export default {
  handleTransaction: provideTransactionHandler(UNISWAP_V3_FACTORY_ADDR, getEthersProvider(), uniswapPoolCache),
};
