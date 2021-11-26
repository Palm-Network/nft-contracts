const NFT = artifacts.require('NFT')

// Replace
const RECIPIENT_ADDRESS = ''
const NFT_ADDRESS = ''
const TOTAL_SUPPLY = 10000

// TODO: improve with binary search
const lastMinted = async (instance) => {
  for (let i = 0; i < TOTAL_SUPPLY; i++) {
    try {
      await instance.ownerOf(i + 1)
    } catch (err) {
      // console.log(err.message)
      return i
    }
  }
}

async function main() {
  const instance = await NFT.at(NFT_ADDRESS)

  const accounts = await web3.eth.getAccounts()
  const minter = accounts[0]

  const gasPrice = await web3.eth.getGasPrice()

  console.log('Getting last minted token')
  const last = await lastMinted(instance)
  const tokenId = last + 1;

  const nonce = await web3.eth.getTransactionCount(minter)
  console.log(`Minting NFT from account ${minter}`)
  console.log(`Minting token ${tokenId} with nonce ${nonce}`)
  const tx = await instance.mint(RECIPIENT_ADDRESS, tokenId, "", {
    from: minter,
    gas: 3500000,
    gasPrice: Number(gasPrice),
    nonce,
  })

  console.log(`Successfully minted token ${tokenId} to receipient: ${RECIPIENT_ADDRESS}`)
}

module.exports = function (callback) {
  main()
    .then(callback)
    .catch((err) => {
      console.error(err.message)
      callback()
    })
}
