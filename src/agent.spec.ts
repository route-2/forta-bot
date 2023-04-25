import { HandleTransaction } from "forta-agent";
import { provideTransactionHandler } from "./agent";
import { MockEthersProvider, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Finding, FindingSeverity, FindingType } from "forta-agent";
import { BigNumber, ethers, utils } from "ethers";
import { UNISWAP_V3_FACTORY_ADDR, UNISWAP_V3_POOL_ABI } from "./constants";
import { createFinding } from "./finding";
import LRU from "lru-cache";
//data for valid swap
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
// another set of data for valid swap
const MOCK_DATA1 = {
  from: createAddress("0x44"),
  to: createAddress("0x55"),
  poolAddress: "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443",
  sender: createAddress("0x66"),
  recipient: createAddress("0x66"),
  token0: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  token1: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  fee: "500",
  amount0: BigNumber.from("444"),
  amount1: BigNumber.from("555"),
  sqrtPriceX96: BigNumber.from("222"),
  liquidity: BigNumber.from("666"),
  tick: BigNumber.from("888"),
};

//data for invalid swap (contains weth-usdc pool of sushiswap)
const MOCK_DATA2 = {
  from: createAddress("0x11"),
  to: createAddress("0x22"),
  poolAddress: "0x905dfcd5649217c42684f23958568e533c711aa3",
  sender: createAddress("0x33"),
  recipient: createAddress("0x33"),
  token0: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  token1: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  fee: "500",
  amount0: BigNumber.from("333"),
  amount1: BigNumber.from("444"),
  sqrtPriceX96: BigNumber.from("111"),
  liquidity: BigNumber.from("222"),
  tick: BigNumber.from("777"),
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
    Ipool = new utils.Interface(UNISWAP_V3_POOL_ABI);
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
      .addEventLog(UNISWAP_V3_POOL_ABI[0], MOCK_DATA.poolAddress, [
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

  it("returns an empty finding if the swaps are from different pools", async () => {
    mockProvider.addCallTo(MOCK_DATA2.poolAddress, 1, Ipool, "token0", { inputs: [], outputs: [MOCK_DATA2.token0] });
    mockProvider.addCallTo(MOCK_DATA2.poolAddress, 1, Ipool, "token1", { inputs: [], outputs: [MOCK_DATA2.token1] });
    mockProvider.addCallTo(MOCK_DATA2.poolAddress, 1, Ipool, "fee", {
      inputs: [],
      outputs: [BigNumber.from(MOCK_DATA2.fee)],
    });

    const txEvent = new TestTransactionEvent()
      .setFrom(MOCK_DATA2.from)
      .setTo(MOCK_DATA2.to)
      .setBlock(1)
      .addEventLog(UNISWAP_V3_POOL_ABI[0], MOCK_DATA2.poolAddress, [
        MOCK_DATA2.sender,
        MOCK_DATA2.recipient,
        MOCK_DATA2.amount0,
        MOCK_DATA2.amount1,
        MOCK_DATA2.sqrtPriceX96,
        MOCK_DATA2.liquidity,
        MOCK_DATA2.tick,
      ]);
    mockProvider.setLatestBlock(1);
    const findings = await handleTransaction(txEvent);

    expect(findings.length).toEqual(0);
    expect(findings).toStrictEqual([]);
  });

  it("returns multiple findings from different pools of uniswap", async () => {
    mockProvider.addCallTo(MOCK_DATA.poolAddress, 0, Ipool, "token0", { inputs: [], outputs: [MOCK_DATA.token0] });
    mockProvider.addCallTo(MOCK_DATA.poolAddress, 0, Ipool, "token1", { inputs: [], outputs: [MOCK_DATA.token1] });
    mockProvider.addCallTo(MOCK_DATA.poolAddress, 0, Ipool, "fee", {
      inputs: [],
      outputs: [BigNumber.from(MOCK_DATA.fee)],
    });
    mockProvider.addCallTo(MOCK_DATA1.poolAddress, 0, Ipool, "token0", { inputs: [], outputs: [MOCK_DATA1.token0] });
    mockProvider.addCallTo(MOCK_DATA1.poolAddress, 0, Ipool, "token1", { inputs: [], outputs: [MOCK_DATA1.token1] });
    mockProvider.addCallTo(MOCK_DATA1.poolAddress, 0, Ipool, "fee", {
      inputs: [],
      outputs: [BigNumber.from(MOCK_DATA1.fee)],
    });

    const txEvent = new TestTransactionEvent()
      .setBlock(0)
      .addEventLog(UNISWAP_V3_POOL_ABI[0], MOCK_DATA.poolAddress, [
        MOCK_DATA.sender,
        MOCK_DATA.recipient,
        MOCK_DATA.amount0,
        MOCK_DATA.amount1,
        MOCK_DATA.sqrtPriceX96,
        MOCK_DATA.liquidity,
        MOCK_DATA.tick,
      ])
      .addEventLog(UNISWAP_V3_POOL_ABI[0], MOCK_DATA1.poolAddress, [
        MOCK_DATA1.sender,
        MOCK_DATA1.recipient,
        MOCK_DATA1.amount0,
        MOCK_DATA1.amount1,
        MOCK_DATA1.sqrtPriceX96,
        MOCK_DATA1.liquidity,
        MOCK_DATA1.tick,
      ]);

    mockProvider.setLatestBlock(0);

    const MOCK_FINDING1 = createFinding(
      MOCK_DATA.poolAddress,
      MOCK_DATA.sender,
      MOCK_DATA.recipient,
      MOCK_DATA.amount0,
      MOCK_DATA.amount1
    );
    const MOCK_FINDING2 = createFinding(
      MOCK_DATA1.poolAddress,
      MOCK_DATA1.sender,
      MOCK_DATA1.recipient,
      MOCK_DATA1.amount0,
      MOCK_DATA1.amount1
    );

    const findings = await handleTransaction(txEvent);
    expect(poolCache.get(MOCK_DATA.poolAddress)).toEqual(true);
    expect(poolCache.get(MOCK_DATA1.poolAddress)).toEqual(true);
    expect(findings.length).toEqual(4);
    expect(JSON.stringify(findings[0])).toStrictEqual(JSON.stringify(MOCK_FINDING1));
    expect(JSON.stringify(findings[3])).toStrictEqual(JSON.stringify(MOCK_FINDING2));
  });
});
