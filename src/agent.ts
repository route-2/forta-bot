import { Finding, HandleTransaction, TransactionEvent,getEthersProvider, FindingSeverity, FindingType } from "forta-agent";
import { providers,utils,BigNumber } from "ethers";
import L1BalanceFetcher from "./l1balance.fetcher";
import L2SupplyFetcher from "./l2supply.fetcher";
import NetworkData, { NETWORK_MAP } from "./network";
import NetworkManager from "./network";
import { formatEther } from "@ethersproject/units";
import { BALANCE_IFACE, L1_DAI,ERC20_TRANSFER_EVENT, L2_DAI, createFinding, TOTALSUPPLY_IFACE } from "./utils";

const networkManager = new NetworkManager(NETWORK_MAP);

const l1BalanceFetcher = new L1BalanceFetcher(
 
  getEthersProvider(),
  BALANCE_IFACE,
  networkManager

);
console.log(l1BalanceFetcher)


const l2SupplyFetcher = new L2SupplyFetcher(
  getEthersProvider(),
 
  networkManager,
  TOTALSUPPLY_IFACE,
);
console.log(l2SupplyFetcher)

export const provideInitialize = (provider: providers.Provider) => async () => {
  const { chainId } = await provider.getNetwork();
  networkManager.setNetwork(chainId);
  l1BalanceFetcher.setTokenContract();

 
};







export function provideHandleTransaction(
  transferEvent:string,
  networkManager: NetworkData,
  l1BalanceFetcher: L1BalanceFetcher,
  l2SupplyFetcher: L2SupplyFetcher
): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];
    console.log(txEvent)
    const txLogs = txEvent.filterLog(transferEvent, L1_DAI);

    for(const tXevent of txLogs){
      const from = tXevent.args.from;
      const to = tXevent.args.to;
      const amount = tXevent.args.value;
      const escrow = networkManager.escrowAddress
      const name = networkManager.name
      const l2Supply: BigNumber = await l2SupplyFetcher.getL2Supply(txEvent.blockNumber);
      const l1Balance: BigNumber = await l1BalanceFetcher.getEscrowBalance(txEvent.blockNumber);
      if(l1Balance< l2Supply){

        findings.push(createFinding(name,escrow,Number(l1Balance),Number(l2Supply)))

      }
      

    }
   
    const escrow = networkManager.escrowAddress
    const name = networkManager.name
    if (!txLogs) return findings;

 
    
    

    return findings;
   

   
   

   
  


   



    
  }


}

export default {   handleTransaction:provideHandleTransaction(
  ERC20_TRANSFER_EVENT,
  networkManager,
  l1BalanceFetcher,
  l2SupplyFetcher
),

initialize: provideInitialize(getEthersProvider())
}
   






