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

export const SWAP_EVENT =
  "event Swap(address indexed sender,address indexed recipient,int256 amount0,int256 amount1,uint160 sqrtPriceX96,uint128 liquidity,int24 tick)";
export const UNISWAP_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
  const findings: Finding[] = [];

  // get all swap events from the transaction
  const swapEvents = txEvent.filterLog(SWAP_EVENT, UNISWAP_V3_FACTORY_ADDR);

  swapEvents.forEach((transferEvent) => {
    const { sender, recipient, amount0, amount1 } = transferEvent.args;

    // create a finding for each swap event
    findings.push(
      Finding.fromObject({
        name: "Uniswap V3 Swap",
        description: `Swap of ${amount0} and ${amount1} between ${sender} and ${recipient}`,
        alertId: "FORTA-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          sender,
          recipient,
          amount0: amount0.toString(),
          amount1: amount1.toString(),
        },
      })
    );
  });

  return findings;
};

export default {

  handleTransaction,
 
};
