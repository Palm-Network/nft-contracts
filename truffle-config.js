/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('@truffle/hdwallet-provider')

require('dotenv').config()

const infuraKey = process.env.INFURA_KEY
const mnemonic = process.env.MNEMONIC

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   *
   *
   */

  networks: {
    localhost: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
    },
    palmtestnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://palm-testnet.infura.io/v3/${infuraKey}`, 0 , 3000),
      network_id: 11297108099, // This network is yours, in the cloud.
      production: true, // Treats this network as if it was a public net. (default: false)
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4, // This network is yours, in the cloud.
      production: true, // Treats this network as if it was a public net. (default: false)
    },
    palm: {
      provider: () => new HDWalletProvider(mnemonic, `https://palm-mainnet.infura.io/v3/${infuraKey}`),
      network_id: 11297108109, // This network is yours, in the cloud.
      production: true, // Treats this network as if it was a public net. (default: false)
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${infuraKey}`),
      network_id: 1, // This network is yours, in the cloud.
      production: true, // Treats this network as if it was a public net. (default: false)
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.6',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000000,
        },
      },
    },
  },

  plugins: ['solidity-coverage'],
}
