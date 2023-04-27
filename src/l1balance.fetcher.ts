import { providers, Contract, BigNumber,utils } from "ethers";
import LRU from "lru-cache";
import { BALANCE_IFACE } from "./utils";
import NetworkData from "./network";



export default class L1BalanceFetcher{
    provider: providers.Provider;
    private cache: LRU<string, BigNumber>;
    tokenContract: Contract;
    private networkManager: NetworkData;

    constructor(provider: providers.Provider,
        tokenInterface:utils.Interface,
        networkManager: NetworkData
    ) {
        this.provider = provider;
        this.cache = new LRU<string, BigNumber>({
            max: 10000,
        });

        this.tokenContract = new Contract(networkManager.escrowAddress,tokenInterface, provider);
        this.networkManager = networkManager;
    }


    public setTokenContract() {
        if (this.tokenContract.address != this.networkManager.escrowAddress) {
          this.tokenContract = new Contract(this.networkManager.escrowAddress, BALANCE_IFACE, this.provider);
        }
      }

    public async getEscrowBalance(block: number): Promise<BigNumber> {

        const key: string = `${this.networkManager.escrowAddress}-${block}`;

        if (this.cache.has(key)) return this.cache.get(key) as  BigNumber;

        const l1Balance:BigNumber = await this.tokenContract.balanceOf(this.networkManager.escrowAddress, { blockTag: block - 1 });

        this.cache.set(
            key,
            l1Balance
        )

        return l1Balance;
    }



}