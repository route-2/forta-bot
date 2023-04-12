# Bot Deployment Tracker

## Description

This bot detects every new bot deployed by Nethermind

## Supported Chains

- Polygon


## Alerts



- FORTA-1
  - Fired when a bot is deployed by nethermind
  - Severity is always set to "info"
  - Type is always set to "info" 
  - Metadata Fields:
      - `agentId`: agentId of the deployed bot
      - `metadata`: metadata of the deployed bot
      - `owner`: deployer
      - `chainIds`: supported chains of the bot


## Test Data

The Bot behaviour can be verified with the following transactions:

- [0xdc46b8201ad0b394638c1f3145cbad3f8f09904737bec52b701795b93fde3a78](https://polygonscan.com/tx/0xdc46b8201ad0b394638c1f3145cbad3f8f09904737bec52b701795b93fde3a78) (`createAgent` function)

