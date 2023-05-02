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
import { L1_DAI, L2_DAI, ERC20_TRANSFER_EVENT, TOTAL_SUPPLY_ABI, TOTALSUPPLY_IFACE,createFinding } from "./utils";
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


  it("should return  findings if L2 total supply  exceed L1 balance", async () => {
    type DAI_DETAILS_TYPE = {
      L1Address: string;
    }
    const DAI_DETAILS: DAI_DETAILS_TYPE[] = [
      {
        L1Address: L1_DAI,
      }]
    let provider = getEthersProvider();
    let block = await provider.getBlockNumber();
    let ERC_20_IFACE= new Interface([ERC20_TRANSFER_EVENT])

    const log:{
     
      data: string,
      topics: string[]
    } = ERC_20_IFACE.encodeEventLog(
      ERC_20_IFACE.getEvent("Transfer"),[
        createAddress("0x111"),
        createAddress("0x222"),
        utils.parseEther("1000")

      ]
    )


    let txEvent = new TestTransactionEvent()
    .addEventLog(ethers.utils.getAddress(L1_DAI), log.data,log.topics)
    .setBlock(block);
    findings = await handleTransaction(txEvent);

    const l2Block: number = await provider.getBlockNumber();

    const tokenContract = new Contract(L2_DAI, TOTALSUPPLY_IFACE, provider);
    const balanceOf = await tokenContract.totalSupply({ blockTag: l2Block - 1 });

    const l2Supply = balanceOf.toNumber();  

    expect(findings).toEqual([createFinding(mockNetworkManager.name, mockNetworkManager.escrowAddress, 0, 1000)]);


  })




  

const TEST_CASES: [number, number, number, number][] = [
  // block, timestamp, escrow balance, L2 totalSupply
  [1, 2, 3, 4],
  [123, 12, 1, 2],
  [444, 44, 4, 4],
  [111, 11, 11, 1],
  [222, 1000, 99, 66],
];


TEST_CASES.forEach(
  ([block, timestamp, escrowBalance, l2Supply]) => {
    it(`returns a finding if L2 total supply exceeds L1 balance at block ${block}`, async () => {
      const mockTotalSupplyFetcher = {
        getL2Supply: jest.fn().mockResolvedValue(ethers.BigNumber.from(l2Supply)),
      };
      const mockBalanceFetcher = {
        getEscrowBalance: jest.fn().mockResolvedValue(ethers.BigNumber.from(escrowBalance)),
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
     
      const findings = await handleTransaction(txEvent);
      expect(findings).toEqual([mockCreateFinding(mockNetworkManager.name, mockNetworkManager.escrowAddress, escrowBalance, l2Supply)]);

    




}
);






   


   

});

  }
  );

