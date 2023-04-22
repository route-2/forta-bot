import { Finding, FindingSeverity, FindingType } from "forta-agent";

export const createFinding = (poolAddress: string,sender:string,recipient:string,amount0:number,amount1:number): Finding => {
    return Finding.fromObject({
        name: "Uniswap V3 Swap Event",
        description: "swap event detected in uniswap v3",
        alertId: "UNISWAP-V3-SWAP-EVENT",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Uniswap",
        metadata:
        {
            poolAddress: poolAddress,
            sender: sender,
            recipient: recipient,
            amount0: amount0.toString(),
            amount1: amount1.toString(),
        },

    });
    }