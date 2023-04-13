import { FindingType, FindingSeverity, Finding, HandleTransaction, createTransactionEvent} from "forta-agent";
import agent from "./agent";
import { SWAP_EVENT,UNISWAP_V3_FACTORY_ADDR } from "./utils";



describe("Swaps done on Uniswap V3", () => {
  let handleTransaction: HandleTransaction;
  const mockTxEvent = createTransactionEvent({} as any);

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no Swaps", async () => {
      mockTxEvent.filterLog = jest.fn().mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(SWAP_EVENT, UNISWAP_V3_FACTORY_ADDR);
    });

    it("returns a finding if there is a Swap on Uniswap", async () => {
     
      
      const mockSwapEvent = {
        args: {
          sender: "0x1234567",
          recipient:"0x5678901",
          amount0:"444",
          amount1:"333"
        },
      };
     
      mockTxEvent.filterLog = jest.fn().mockReturnValue([mockSwapEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Uniswap V3 Swap",
          description: `Swap of ${mockSwapEvent.args.amount0} and ${mockSwapEvent.args.amount1} between ${mockSwapEvent.args.sender} and ${mockSwapEvent.args.recipient}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            sender:mockSwapEvent.args.sender,
            recipient:mockSwapEvent.args.recipient,
            amount0: mockSwapEvent.args.amount0,
            amount1:mockSwapEvent.args.amount1,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(SWAP_EVENT, UNISWAP_V3_FACTORY_ADDR);

    });

    it("returns multiple findings if there are multiple Swaps on Uniswap", async () => {

      const mockSwapEvent1 = {
        args: {
          sender: "0x1234567",
          recipient:"0x5678901",
          amount0:"444",
          amount1:"333"
        },
      };
      const mockSwapEvent2 = {
        args: {
          sender: "0x11111",
          recipient:"0x66666",
          amount0:"222",
          amount1:"3333"
        },
      };
      const mockSwapEvent3 = {
        args: {
          sender: "0x44444",
          recipient:"0x55555",
          amount0:"111",
          amount1:"4444"
        },
      };
      mockTxEvent.filterLog = jest.fn().mockReturnValue([mockSwapEvent1,mockSwapEvent2,mockSwapEvent3]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Uniswap V3 Swap",
          description: `Swap of ${mockSwapEvent1.args.amount0} and ${mockSwapEvent1.args.amount1} between ${mockSwapEvent1.args.sender} and ${mockSwapEvent1.args.recipient}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            sender:mockSwapEvent1.args.sender,
            recipient:mockSwapEvent1.args.recipient,
            amount0: mockSwapEvent1.args.amount0,
            amount1:mockSwapEvent1.args.amount1,
          },
        }),
        Finding.fromObject({
          name: "Uniswap V3 Swap",
          description: `Swap of ${mockSwapEvent2.args.amount0} and ${mockSwapEvent2.args.amount1} between ${mockSwapEvent2.args.sender} and ${mockSwapEvent2.args.recipient}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            sender:mockSwapEvent2.args.sender,
            recipient:mockSwapEvent2.args.recipient,
            amount0: mockSwapEvent2.args.amount0,
            amount1:mockSwapEvent2.args.amount1,
          },
        }),
        Finding.fromObject({
          name: "Uniswap V3 Swap",
          description: `Swap of ${mockSwapEvent3.args.amount0} and ${mockSwapEvent3.args.amount1} between ${mockSwapEvent3.args.sender} and ${mockSwapEvent3.args.recipient}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            sender:mockSwapEvent3.args.sender,
            recipient:mockSwapEvent3.args.recipient,
            amount0: mockSwapEvent3.args.amount0,
            amount1:mockSwapEvent3.args.amount1,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(SWAP_EVENT, UNISWAP_V3_FACTORY_ADDR);







  });
});
});
