## About

This repo contains a basic ERC-721 ([NFT.sol](contracts/NFT.sol)) implementation with royalties, useful for fixed-size, one-time drops.  

As a base, we used [OpenZeppelin's ERC721 implementation and extensions](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC721).

One key difference is that we overwrite `tokenUri()` in order to support the following schema for each nft id: `<base uri>/<nft id>.json`. This allows us to replace the metadata for all tokens at once (as we will be using IPFS directories).

The token implements [ERC2981](https://eips.ethereum.org/EIPS/eip-2981). This allows marketplaces to obtain information about royalties from the token contract.

## Instructions

First run `yarn` to install dependencies.

### Deploying / Minting

1. Create a `.env` file and add `MNEMONIC` and `INFURA_KEY`.
2. Replace the constants in the scripts in the `scripts` directory (`NFT_ADDRESS`, `RECIPIENT_ADDRESS`, etc)
3. Run the scripts:

```bash
// Compile the contracts
yarn compile

// Replace localhost with the appropriate environment from truffle-config.js
npx truffle exec scripts/deploy.js --network localhost
npx truffle exec scripts/mint.js --network localhost
```

### Testing

`yarn test`
