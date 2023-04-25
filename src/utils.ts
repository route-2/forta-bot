import { defaultAbiCoder, getCreate2Address, solidityKeccak256 } from "ethers/lib/utils";
import { INIT_CODE, UNISWAP_V3_POOL_ABI } from "./constants";
import LRU from "lru-cache";
import { ethers } from "ethers";

type CacheValue = boolean;

// create a new cache instance with a maximum size of 500
export const uniswapPoolCache = new LRU<string, CacheValue>({
  max: 500,
});
export const isUniswapPool = async (
  factoryAddress: string,
  provider: ethers.providers.Provider,
  poolCache: LRU<string, CacheValue>,
  pairAddress: string,
  block: number
): Promise<boolean> => {
  if (poolCache.has(pairAddress)) return poolCache.get(pairAddress) as unknown as Promise<boolean>;
  const poolContract = new ethers.Contract(pairAddress, UNISWAP_V3_POOL_ABI, provider);
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

export const computePoolAddress = (factoryAddress: string, tokenA: string, tokenB: string, fee: string): string => {
  const [token0, token1] = tokenA > tokenB ? [tokenB, tokenA] : [tokenA, tokenB];
  const encoded_byte = defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee]);
  const salt = solidityKeccak256(["bytes"], [encoded_byte]);
  const address = getCreate2Address(factoryAddress, salt, INIT_CODE);
  return address;
};
