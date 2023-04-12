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


const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return findings;

  // filter the transaction logs for Tether transfer events
  const tetherTransferEvents = txEvent.filterLog(
    ERC20_TRANSFER_EVENT,
    TETHER_ADDRESS
  );

  tetherTransferEvents.forEach((transferEvent) => {
    // extract transfer event arguments
    const { to, from, value } = transferEvent.args;
    // shift decimals of transfer value
    const normalizedValue = value.div(10 ** TETHER_DECIMALS);

    // if more than 10,000 Tether were transferred, report it
    if (normalizedValue.gt(10000)) {
      findings.push(
        Finding.fromObject({
          name: "High Tether Transfer",
          description: `High amount of USDT transferred: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to,
            from,
          },
        })
      );
      findingsCount++;
    }
  });

  return findings;
};

// const initialize: Initialize = async () => {
//   // do some initialization on startup e.g. fetch data
// }

// const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
//   const findings: Finding[] = [];
//   // detect some block condition
//   return findings;
// }

// const handleAlert: HandleAlert = async (alertEvent: AlertEvent) => {
//   const findings: Finding[] = [];
//   // detect some alert condition
//   return findings;
// }

export default {
  // initialize,
  handleTransaction,
  // handleBlock,
  // handleAlert
};
