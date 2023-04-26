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
import { BigNumber } from "ethers";
import { L1_DAI, L2_DAI, ERC20_TRANSFER_EVENT } from "./utils";
import L1BalanceFetcher from "./l1balance.fetcher";
import L2SupplyFetcher from "./l2supply.fetcher";
import NetworkManager from "./network";
import { NETWORK_MAP } from "./network";
import { ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { Contract } from "ethers";
import { provideHandleTransaction } from "./agent";

const TRANSFER_EVENT_INTERFACE = new Interface([ERC20_TRANSFER_EVENT]);




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





const MOCK_TRANSFER_FUNCTION: string = "event Transfer(address indexed from, address indexed to, uint256 value)"



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
  


  const mockL1BalanceFetcher = new L1BalanceFetcher(mockProvider as any, mockNetworkManager as any);



  beforeEach(() => {
    findings = [];
    txEvent = new TestTransactionEvent();
    handleTransaction = provideHandleTransaction(MOCK_TRANSFER_FUNCTION, mockNetworkManager as any, mockBalanceFetcher as any, mockTotalSupplyFetcher as any);
  }
  );

  it("should return no findings if no Transfer events", async () => {
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toEqual([]);
  }
  );







 

}
);