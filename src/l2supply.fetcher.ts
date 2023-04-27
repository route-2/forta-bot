import { BigNumber, Contract,utils, providers } from "ethers";
import LRU from "lru-cache";
import NetworkData from "./network";
import { TOTAL_SUPPLY_ABI } from "./utils";


export default class L2SupplyFetcher{

    provider: providers.Provider;
    private networkManager: NetworkData;
    private cache: LRU<string, BigNumber>;
    tokenContract: Contract;

    constructor(provider: providers.Provider, networkManager: NetworkData,tokenInterface: utils.Interface) {
        this.provider = provider;
        this.networkManager = networkManager;
        this.tokenContract = new Contract(networkManager.escrowAddress, tokenInterface, provider);
        this.cache = new LRU<string, BigNumber>({ max: 10000 });
      }


    public async getL2Supply(block: number): Promise<BigNumber> {

        const key: string = `${this.networkManager.escrowAddress}-${block}`;

        if (this.cache.has(key)) return this.cache.get(key) as  BigNumber;

        const l2Supply:BigNumber = await this.tokenContract.totalSupply({ blockTag: block - 1 });

        this.cache.set(
            key,
            l2Supply
        )

        return l2Supply;
    }
}

