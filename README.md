# Uniswap V3 Swap Tracker

## Description

This bot detects every swaps made on Uniswap V3 Pools.

## Supported Chains

- Polygon
- Ethereum
- Arbitrum


## Alerts



- UNISWAP-V3-SWAP-EVENT
  - Fired when there's a swap on Uniswap V3
  - Severity is always set to "info"
  - Type is always set to "info" 
  - Metadata Fields:
    - poolAddress: Address of the Smart Contract (Uniswap V3 Pool),
    - sender: Person who initiates the swap,
    - recipient: Person who recieves the swapped assets,
    - amount0:Amount of token swapped,
    - amount1:Amount of token recieved
                

## Test Data

The behaviour of the bot can be verified with the following transactions:
   * [0xabce8fb2cd9fa9336e885cca8ad529e143ff858c7f2feee535d1c8dff250eed0](https://polygonscan.com//tx/0xabce8fb2cd9fa9336e885cca8ad529e143ff858c7f2feee535d1c8dff250eed0)
   * [0x42c6bf78c27a663228a751e4f75d16a3e4c24dad64633e23636dd6d46c0cdf06](https://arbiscan.io//tx/0x42c6bf78c27a663228a751e4f75d16a3e4c24dad64633e23636dd6d46c0cdf06)



