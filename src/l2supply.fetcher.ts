import { providers, Contract, utils, BigNumber } from "ethers";
import LRU from "lru-cache";
import { Interface } from "ethers/lib/utils";
import { TOTALSUPPLY_DAI_ABI } from "./utils";


export default class L2SupplyFetcher {

    readonly provider: providers.Provider;
    private cache: LRU<number, BigNumber>;
    private tokenContract: Contract;
   

    constructor(provider: providers.Provider
        , tokenAddress: string,
       
    ) {
        this.provider = provider;
        this.cache = new LRU<number, BigNumber>({
            max: 10000,
        });

        this.tokenContract = new Contract(tokenAddress, TOTALSUPPLY_DAI_ABI, provider);
       
        
    }

    public async getL2Supply(block: number): Promise<BigNumber> {
            
            const key: number = block;
    
            if (this.cache.has(key)) return this.cache.get(key) as  BigNumber;
    
            const l2Supply:BigNumber = await this.tokenContract.totalSupply({ blockTag: block - 1 });
    
            this.cache.set(
                key,
                l2Supply
            )
    
            return l2Supply;
        }

   

}


















// export default class L2SupplyFetcher {
//     readonly provider: providers.Provider;
//   private cache: LRU<number, BigNumber>;
//   private tokenContract: Contract;

//     constructor(provider: providers.Provider
//     , tokenAddress: string,
//      ) {
//     this.provider = provider;
//     this.cache = new LRU<number, BigNumber>({
//         max: 10000,
//     });

//     this.tokenContract = new Contract(tokenAddress, new Interface(TOTALSUPPLY_DAI_ABI), this.provider);

// }

// public async getL2Supply(): Promise<BigNumber> {
    
//         const key: number = await this.provider.getBlockNumber();

    
//         if (this.cache.has(key)) return this.cache.get(key) as unknown as Promise<any>;
    
//         const l2Supply = await this.tokenContract.totalSupply({ blockTag: key - 1 });
    
//         this.cache.set(
//             key,
//             l2Supply
//         )
    
//         return l2Supply;

// }



// }