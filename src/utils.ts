import { utils, providers, BigNumber } from "ethers";
import { Finding, FindingSeverity, FindingType } from "forta-agent";
import { Interface } from "ethers/lib/utils";
import { Contract } from "ethers";


 










export const L1_DAI: string = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const L2_DAI: string = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
export const BALANCE_IFACE = new Interface(
    [
        "function balanceOf(address account) external view returns (uint256)",
    ]
)
export const TOTALSUPPLY_IFACE = new Interface(
    [
        "function totalSupply() external view returns (uint256)",
    ]
)

export const ERC20_TRANSFER_EVENT:string = "event Transfer(address indexed from, address indexed to, uint256 value)";
export const TOTAL_SUPPLY_ABI = ["function totalSupply() external view returns (uint256)"]




export const createFinding = (
    name: string,
    address:string,
    l1Balance:number,
    l2Supply:number
    ): Finding => {
    return Finding.fromObject({
        name: "DAI total supply exceeds balance ",
        description: `L2 ${name} total supply of DAI exceeds and violates balance at L1 ${name} Escrow`,
        alertId: `${name}-Transfer`,
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "MakerDao",
        metadata: {
            address: address,
            l1Balance: l1Balance.toString(),
            l2Supply: l2Supply.toString(),
        },
    });
}





