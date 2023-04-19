import { HandleTransaction } from "forta-agent";
import { provideTransactionHandler } from "./agent";
import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Finding, FindingSeverity, FindingType } from "forta-agent";
import { BigNumber, ethers, utils } from "ethers";
import { UNISWAP_V3_FACTORY_ADDR, UNISWAP_V3_POOL_ADDR } from "./constants";
import LRU from "lru-cache";

const MOCK_DATA = {
  from: createAddress("0x44"),
  to: createAddress("0x55"),
  poolAddress: "0xa374094527e1673a86de625aa59517c5de346d32",
  sender: createAddress("0x22"),
  recipient: createAddress("0x22"),
  token0: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  token1: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  fee: "500",
  amount0: BigNumber.from("222"),
  amount1: BigNumber.from("444"),
  sqrtPriceX96: BigNumber.from("111"),
  liquidity: BigNumber.from("333"),
  tick: BigNumber.from("666"),
};

describe("UNISWAP BOT TEST", () => {
  let handleTransaction: HandleTransaction;
  let poolCache: LRU<string, boolean>;
  let provider: ethers.providers.Provider;
  let mockProvider: MockEthersProvider;
  let Ipool: utils.Interface;

  beforeEach(() => {
    mockProvider = new MockEthersProvider();
    poolCache = new LRU<string, boolean>({ max: 1000 });
    provider = mockProvider as unknown as ethers.providers.Provider;
    Ipool = new utils.Interface(UNISWAP_V3_POOL_ADDR);
    handleTransaction = provideTransactionHandler(UNISWAP_V3_FACTORY_ADDR, provider, poolCache);
  });

  it("returns an empty finding if there are no swap events", async () => {
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings.length).toEqual(0);
    expect(findings).toStrictEqual([]);
  });

  it("returns a finding if there is a swap event", async () => {
    const txEvent = new TestTransactionEvent()
      .setFrom(MOCK_DATA.from)
      .setTo(MOCK_DATA.to)
      .setBlock(0)
      .addEventLog(UNISWAP_V3_POOL_ADDR[0], MOCK_DATA.poolAddress, [
        MOCK_DATA.sender,
        MOCK_DATA.recipient,
        MOCK_DATA.amount0,
        MOCK_DATA.amount1,
        MOCK_DATA.sqrtPriceX96,
        MOCK_DATA.liquidity,
        MOCK_DATA.tick,
      ]);

    mockProvider.addCallTo(MOCK_DATA.poolAddress, 0, Ipool, "token0", { inputs: [], outputs: [MOCK_DATA.token0] });
    mockProvider.addCallTo(MOCK_DATA.poolAddress, 0, Ipool, "token1", { inputs: [], outputs: [MOCK_DATA.token1] });
    mockProvider.addCallTo(MOCK_DATA.poolAddress, 0, Ipool, "fee", {
      inputs: [],
      outputs: [BigNumber.from(MOCK_DATA.fee)],
    });

    mockProvider.setLatestBlock(0);
    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Uniswap V3 Swap Event",
        description: `swap event detected in uniswap v3`,
        alertId: "UNISWAP-V3-SWAP-EVENT",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Uniswap",
        metadata: {
          poolAddress: MOCK_DATA.poolAddress,
          sender: MOCK_DATA.sender,
          recipient: MOCK_DATA.recipient,
          amount0: MOCK_DATA.amount0.toString(),
          amount1: MOCK_DATA.amount1.toString(),
        },
      }),
    ]);

    expect(poolCache.get(MOCK_DATA.poolAddress)).toEqual(true);
    expect(mockProvider.call).toBeCalledTimes(3);
  });
});
