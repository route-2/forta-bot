import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  TransactionEvent,
  getEthersProvider,
} from "forta-agent";
import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import {createAddress} from "forta-agent-tools"
import { BigNumber,utils } from "ethers";
import { L1_DAI, L2_DAI, ERC20_TRANSFER_EVENT, TOTAL_SUPPLY_ABI, TOTALSUPPLY_IFACE } from "./utils";
import NetworkData from "./network";
import L1BalanceFetcher from "./l1balance.fetcher";
import L2SupplyFetcher from "./l2supply.fetcher";
import NetworkManager from "./network";
import { NETWORK_MAP } from "./network";
import { ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { Contract } from "ethers";
import { provideHandleTransaction } from "./agent";

const TRANSFER_EVENT_INTERFACE = new Interface([ERC20_TRANSFER_EVENT]);

const MOCK_DAI_ADDRESS = L1_DAI;




const createFinding = (
  name: string,
  amount: BigNumber,
  from: string,
  to: string,
  escrow: string
): Finding => {
  return Finding.fromObject({
    name: "DAI total supply exceeds balance ",
    description: `L2 ${name} total supply of DAI exceeds and violates balance at L1 ${name} Escrow`,
    alertId: `${name}-Transfer`,
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "MakerDao",
    metadata: {
      from: from,
      to: to,
      escrow: escrow,
      amount: amount.toString(),
    },
  });
}
const mockTotalSupplyFetcher = {
  getL2Supply: jest.fn(),
};
const mockBalanceFetcher = {
  getEscrowBalance: jest.fn(),
};









describe("MakerDao Dai L1 Escrow Balance and L2 Total Supply Check", () => {
  let handleTransaction: HandleTransaction;
  let txEvent: TransactionEvent;
  let findings: Finding[];
  jest.setTimeout(10000);

  const mockProvider = new MockEthersProvider();
  const mockNetworkManager = {
    name: "Optimism",
    escrowAddress: createAddress("0x222"),
  
  };
  const mockTotalSupplyFetcher = {
    getL2Supply: jest.fn(),
  };
  
  const mockCreateFinding = (
    name: string,
    address:string,
    l1Balance:number,
    l2Supply:number

  )  : Finding => {
    return Finding.fromObject({
        name: "DAI total supply exceeds balance ",
        description: `L2 ${name} total supply of DAI exceeds and violates balance at L1 ${name} Escrow`,
        alertId: `${name}-Transfer`,
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "MakerDao",
        metadata: {
            address: address,
            l1Balance: l1Balance.toString(),
            l2Supply: l2Supply.toString(),
        },


    })
  }


 


  beforeEach(() => {
   
    handleTransaction = provideHandleTransaction(ERC20_TRANSFER_EVENT, mockNetworkManager as any, mockBalanceFetcher as any, mockTotalSupplyFetcher as any);
  }
  );

  it("should return no findings if no Transfer events", async () => {
    let txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toEqual([]);
  }
  );

  it("returns a total supply exceed balance", async() => {

    const mockTotalSupplyFetcher = {
      getL2Supply: jest.fn().mockResolvedValue(ethers.BigNumber.from(1000)),
    };
    const mockBalanceFetcher = {
      getEscrowBalance: jest.fn().mockResolvedValue(ethers.BigNumber.from(100)),
    };
    const mockNetworkManager = {
      name: "Optimism",
      escrowAddress: createAddress("0x222"),

    };
    const mockCreateFinding = (
      name: string,
      address:string,
      l1Balance:number,
      l2Supply:number

    )  : Finding => {
      return Finding.fromObject({
          name: "DAI total supply exceeds balance ",
          description: `L2 ${name} total supply of DAI exceeds and violates balance at L1 ${name} Escrow`,
          alertId: `${name}-Transfer`,
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "MakerDao",
          metadata: {
              address: address,
              l1Balance: l1Balance.toString(),
              l2Supply: l2Supply.toString(),
          },
        
          

      })
    }
    let block = 11291046;
    let provider = getEthersProvider();
    const MOCK_FROM_ADDRESS = createAddress("0x0001a");
const MOCK_TO_ADDRESS = mockNetworkManager.escrowAddress;
const MOCK_L2_DAI_ADDRESS = L2_DAI;

const MOCK_AMOUNT = ethers.BigNumber.from(1000);

const log = TRANSFER_EVENT_INTERFACE.encodeEventLog(
  ERC20_TRANSFER_EVENT,
  [MOCK_FROM_ADDRESS, MOCK_TO_ADDRESS, MOCK_AMOUNT]
);

txEvent = new TestTransactionEvent()
.addEventLog(MOCK_DAI_ADDRESS, log.data)
.setBlock(block);
const l2Block: number = await provider.getBlockNumber();
const tokenContract = new Contract(MOCK_L2_DAI_ADDRESS,TOTAL_SUPPLY_ABI ,provider);
const l2Supply = await tokenContract.totalSupply({ blockTag: l2Block - 1 });
expect(findings).toStrictEqual([
  createFinding(
    mockNetworkManager.name,
    l2Supply,
    MOCK_FROM_ADDRESS,
    MOCK_TO_ADDRESS,
    MOCK_L2_DAI_ADDRESS,
  ),
]);
}
);






   


   

});
