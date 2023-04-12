import { FindingType, FindingSeverity, Finding, HandleTransaction } from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { provideHandleTransaction } from "./agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Interface } from "@ethersproject/abi";
import { BigNumber } from "ethers";

import { NETHERMIND_DEPLOYER_ADDRESS, CREATE_AGENT, FORTA_CONTRACT_ADDRESS } from "./utils";

const TEST_DATA_1 = {
  agentId: "44444444",
  owner: NETHERMIND_DEPLOYER_ADDRESS,
  chainIds: "333",
  metadata: "abcdefghi",
};
const TEST_DATA_2 = {
  agentId: "4444",
  owner: createAddress("0x44"),
  chainIds: "222",
  metadata: "jklmnopqr",
};

const TEST_DEPLOYER_ADDRESS = createAddress("0x123");
const TEST_DEPLOYER_ADDRESS2 = createAddress("0x456");

describe("Nethermind Agent", () => {
  let handleTransaction: HandleTransaction;
  let fortaProxy = new Interface([CREATE_AGENT]);
  let txEvent;
  let findings: Finding[];

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(CREATE_AGENT, FORTA_CONTRACT_ADDRESS, TEST_DEPLOYER_ADDRESS);
  });
  it("returns empty findings if no transactions", async () => {
    let txEvent = new TestTransactionEvent();
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if it's a different deployer", async () => {
    const TEST_DEPLOYER = createAddress("0x1");
    txEvent = new TestTransactionEvent()
      .setFrom(TEST_DEPLOYER)
      .setTo(FORTA_CONTRACT_ADDRESS)
      .addTraces({
        function: "" || fortaProxy.getFunction("createAgent") || undefined,
        to: FORTA_CONTRACT_ADDRESS,
        from: TEST_DEPLOYER,

        arguments: [
          TEST_DATA_1.agentId,
          TEST_DEPLOYER,
          TEST_DATA_1.metadata,
          [BigNumber.from(TEST_DATA_1.chainIds[0])],
        ],
      });

    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns findings if it's from deployer", async () => {
    txEvent = new TestTransactionEvent()
      .setFrom(TEST_DEPLOYER_ADDRESS)
      .setTo(FORTA_CONTRACT_ADDRESS)
      .addTraces({
        function: "" || fortaProxy.getFunction("createAgent") || undefined,
        to: FORTA_CONTRACT_ADDRESS,
        from: TEST_DEPLOYER_ADDRESS,

        arguments: [
          TEST_DATA_1.agentId,
          TEST_DEPLOYER_ADDRESS,
          TEST_DATA_1.metadata,
          [BigNumber.from(TEST_DATA_1.chainIds[0])],
        ],
      });

    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "New Nethermind Bot Created",
        description: `New bot deployed by NM`,
        alertId: "FORTA-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          agentId: TEST_DATA_1.agentId,
          owner: TEST_DEPLOYER_ADDRESS,
          chainIds: TEST_DATA_1.chainIds[0],
          metadata: TEST_DATA_1.metadata,
        },
      }),
    ]);
  });

  it("returns findings from multiple deployers", async () => {
    txEvent = new TestTransactionEvent()
      .setFrom(TEST_DEPLOYER_ADDRESS)
      .setTo(FORTA_CONTRACT_ADDRESS)
      .addTraces({
        function: "" || fortaProxy.getFunction("createAgent") || undefined,
        to: FORTA_CONTRACT_ADDRESS,
        from: TEST_DEPLOYER_ADDRESS,

        arguments: [
          TEST_DATA_1.agentId,
          TEST_DEPLOYER_ADDRESS,
          TEST_DATA_1.metadata,
          [BigNumber.from(TEST_DATA_1.chainIds[0])],
        ],
      })
      .addTraces({
        function: "" || fortaProxy.getFunction("createAgent") || undefined,
        to: FORTA_CONTRACT_ADDRESS,
        from: TEST_DEPLOYER_ADDRESS2,

        arguments: [
          TEST_DATA_2.agentId,
          TEST_DEPLOYER_ADDRESS2,
          TEST_DATA_2.metadata,
          [BigNumber.from(TEST_DATA_2.chainIds[0])],
        ],
      });

    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "New Nethermind Bot Created",
        description: `New bot deployed by NM`,
        alertId: "FORTA-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          agentId: TEST_DATA_1.agentId,
          owner: TEST_DEPLOYER_ADDRESS,
          chainIds: TEST_DATA_1.chainIds[0],
          metadata: TEST_DATA_1.metadata,
        },
      }),
      Finding.fromObject({
        name: "New Nethermind Bot Created",
        description: `New bot deployed by NM`,
        alertId: "FORTA-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          agentId: TEST_DATA_2.agentId,
          owner: TEST_DEPLOYER_ADDRESS2,
          chainIds: TEST_DATA_2.chainIds[0],
          metadata: TEST_DATA_2.metadata,
        },
      }),
    ]);
  });
});
