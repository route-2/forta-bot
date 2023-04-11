import {
  BlockEvent,
  Finding,
  Initialize,
  HandleBlock,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import {
  NETHERMIND_DEPLOYER_ADDRESS,
  FORTA_CONTRACT_ADDRESS,
  CREATE_AGENT,
} from "./utils";

export function provideHandleTransaction(
  functionAbi: string,
  proxy: string,
  deployer: string
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    if (txEvent.from != deployer.toLowerCase()) {
      return findings;
    }

    const createBotTx = txEvent.filterFunction(functionAbi, proxy);

    createBotTx.forEach((call) => {
      const { agentId, owner, chainIds, metadata } = call.args;
      findings.push(
        Finding.fromObject({
          name: "New Nethermind Bot Created",
          description: `New bot deployed by NM`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            agentId: agentId.toString(),
            owner,
            chainIds: chainIds.toString(),
            metadata,
          },
        })
      );
    });

    return findings;
  };
}

export default {
  
  handleTransaction: provideHandleTransaction(
    CREATE_AGENT,
    NETHERMIND_DEPLOYER_ADDRESS,
    FORTA_CONTRACT_ADDRESS
  ),
  
};