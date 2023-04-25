import { utils, providers, BigNumber } from "ethers";
require("dotenv").config();








export const L1_OPTIMISM_ESCROW: string = "0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65";
export const L1_ARBITRUM_ESCROW: string = "0xA10c7CE4b876998858b1a9E12b10092229539400";
export const L1_DAI: string = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const L2_DAI: string = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
export const BALANCEOF_DAI_ABI:string = "function balanceOf(address account) external view returns (uint256)";
export const TOTALSUPPLY_DAI_ABI:string = "function totalSupply() external view returns (uint256)";
export const DAI_IFACE: utils.Interface = new utils.Interface([BALANCEOF_DAI_ABI, TOTALSUPPLY_DAI_ABI]);
