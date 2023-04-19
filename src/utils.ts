import { defaultAbiCoder, getCreate2Address, solidityKeccak256 } from "ethers/lib/utils";
import { INIT_CODE } from "./constants";
import LRU from "lru-cache";

type CacheValue = boolean;

// create a new cache instance with a maximum size of 500
export const uniswapPoolCache = new LRU<string, CacheValue>({
  max: 500,
});

export const computePoolAddress = (factoryAddress: string, tokenA: string, tokenB: string, fee: string): string => {
  const [token0, token1] = tokenA > tokenB ? [tokenB, tokenA] : [tokenA, tokenB];
  const encoded_byte = defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee]);
  const salt = solidityKeccak256(["bytes"], [encoded_byte]);
  const address = getCreate2Address(factoryAddress, salt, INIT_CODE);
  return address;
};
