import { providers, Contract,utils, BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";
import LRU from "lru-cache";
import { BALANCEOF_DAI_ABI } from "./utils";
import NetworkData from "./network";

export default class L1BalanceFetcher {
 provider: providers.Provider;
  private cache: LRU<number, BigNumber>;
  tokenContract: Contract;
  private networkManager: NetworkData;

  constructor(provider: providers.Provider

    , networkManager: NetworkData) {
    this.provider = provider;
    this.cache = new LRU<number, BigNumber>({
      max: 10000,
    });
    
    this.tokenContract = new Contract(networkManager.escrowAddress, new Interface (BALANCEOF_DAI_ABI), this.provider);
    this.networkManager = networkManager;
    
  }


  public async getEscrowBalance(block:number): Promise<BigNumber> {

    const key: number = block;

    if (this.cache.has(key)) return this.cache.get(key) as unknown as  Promise<any>;
   
    const l1Balance:BigNumber = await this.tokenContract.balanceOf(this.networkManager.escrowAddress, { blockTag: block - 1 });
   


    this.cache.set(
        key,
        l1Balance
    )

    return l1Balance;
  }





  



}