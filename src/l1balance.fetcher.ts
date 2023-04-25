import { providers, Contract,utils, BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";
import LRU from "lru-cache";
import { BALANCEOF_DAI_ABI } from "./utils";

export default class L1BalanceFetcher {
readonly provider: providers.Provider;
  private cache: LRU<number, BigNumber>;
  private tokenContract: Contract;
  private escrowAddress: string;

  constructor(provider: providers.Provider
    , tokenAddress: string
    , escrowAddress: string) {
    this.provider = provider;
    this.cache = new LRU<number, BigNumber>({
      max: 10000,
    });
    
    this.tokenContract = new Contract(tokenAddress, new Interface (BALANCEOF_DAI_ABI), this.provider);

    this.escrowAddress = escrowAddress;
  }


  public async getEscrowBalance(block:number): Promise<BigNumber> {

    const key: number = block;

    if (this.cache.has(key)) return this.cache.get(key) as unknown as  Promise<any>;
   
    const l1Balance = await this.tokenContract.balanceOf(this.escrowAddress, { blockTag: block - 1 });
   


    this.cache.set(
        key,
        l1Balance
    )

    return l1Balance;
  }



  



}