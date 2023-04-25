import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType } from "forta-agent";
import { providers } from "ethers";
import L1BalanceFetcher from "./L1balance.fetcher";
import L2SupplyFetcher from "./L2supply.fetcher";
import { L1_OPTIMISM_ESCROW, L1_ARBITRUM_ESCROW, L1_DAI, L2_DAI } from "./utils";
import { BigNumber } from "ethers";
import { getBalanceOf } from "./utils";
const L1BalanceFetcherInstance = new L1BalanceFetcher(new providers.JsonRpcProvider("https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"), L1_DAI, L1_OPTIMISM_ESCROW);



