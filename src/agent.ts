import { Finding, HandleTransaction, TransactionEvent,getEthersProvider, FindingSeverity, FindingType } from "forta-agent";
import { providers,utils,BigNumber } from "ethers";
import L1BalanceFetcher from "./l1balance.fetcher";
import L2SupplyFetcher from "./l2supply.fetcher";
import NetworkData, { NETWORK_MAP } from "./network";
import NetworkManager from "./network";
import { DAI_IFACE, L1_DAI,ERC20_TRANSFER_EVENT, L2_DAI, createFinding } from "./utils";

const networkManager = new NetworkManager(NETWORK_MAP);
const l1BalanceFetcher = new L1BalanceFetcher(getEthersProvider(),networkManager)
const l2SupplyFetcher = new L2SupplyFetcher(getEthersProvider(),L2_DAI)


export const provideInitialize = (provider: providers.Provider) => async () => {
  const { chainId } = await provider.getNetwork();
  networkManager.setNetwork(chainId);
 
};






export function provideHandleTransaction(
  transferEvent:string,
  networkManager: NetworkData,
  l1BalanceFetcher: L1BalanceFetcher,
  l2SupplyFetcher: L2SupplyFetcher
): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];
    const daiTransferFunctionCall = txEvent.filterLog(transferEvent, L1_DAI);

    if (!daiTransferFunctionCall) return findings;
    for (const transferEvent of daiTransferFunctionCall){
      const { from, to, value } = transferEvent.args;
      const l1Balance: BigNumber = await l1BalanceFetcher.getEscrowBalance(txEvent.blockNumber);
      const l2Supply: BigNumber = await l2SupplyFetcher.getL2Supply(txEvent.blockNumber);
      if (l1Balance.lt(l2Supply)){
        findings.push(createFinding(
          networkManager.name,
          value,
          from,
          to,
          networkManager.escrowAddress,
        ))
      }
    }
    
    

    return findings;
   

   
   

   
  


   



    
  }


}

export default provideHandleTransaction(ERC20_TRANSFER_EVENT,networkManager,l1BalanceFetcher,l2SupplyFetcher);
   






