const NFT = artifacts.require('NFT')

// Replace
const NAME = ''
const SYMBOL = ''
const URI = ''
const ROYALTY_WALLET = ''
const ROYALTY_FEE = 0

async function main() {
  const accounts = await web3.eth.getAccounts()
  const deployer = accounts[0]

  const gasPrice = await web3.eth.getGasPrice()
  const nonce = await web3.eth.getTransactionCount(deployer)

  console.log(`Deploying nft with account ${deployer}`)

  const instance = await NFT.new(NAME, SYMBOL, URI, ROYALTY_WALLET, ROYALTY_FEE, {
    from: deployer,
    gas: 4000000, // should be enough
    gasPrice,
    nonce,
  })

  console.log(`Deployed at: ${instance.address}`)
}

module.exports = function (callback) {
  main()
    .then(callback)
    .catch((err) => {
      console.error(err.message)
      callback()
    })
}
