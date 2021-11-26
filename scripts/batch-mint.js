const NFT = artifacts.require('NFT')

// Replace
const RECIPIENT_ADDRESS = ''
const NFT_ADDRESS = ''
const NFT_AMOUNT = 10000
const CHUNK_SIZE = 30 // Can be higher for palm mainnet

const splitChunks = (array, size) =>
  Array(Math.ceil(array.length / size))
    .fill()
    .map((_, index) => index * size)
    .map((begin) => array.slice(begin, begin + size))

// TODO: improve with binary search
const lastMinted = async (instance) => {
  for (let i = 0; i < NFT_AMOUNT; i++) {
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

  console.log(`Starting from nft ${last + 1}`)

  const allIds = Array.from({ length: NFT_AMOUNT - last }, (_, i) => i + 1 + last)

  const chunks = splitChunks(allIds, CHUNK_SIZE)

  console.log(`Number of chunks to mint: ${chunks.length}`)

  for (let i = 0; i < chunks.length; i++) {
    const nonce = await web3.eth.getTransactionCount(minter)
    console.log(`Minting chunk ${i} with nonce ${nonce}`)
    const tx = await instance.mint(RECIPIENT_ADDRESS, chunks[i], {
      from: minter,
      gas: 3500000,
      gasPrice: Number(gasPrice),
      nonce,
    })

    // console.log(tx)
  }

  console.log('All chunks minted')
}

module.exports = function (callback) {
  main()
    .then(callback)
    .catch((err) => {
      console.error(err.message)
      callback()
    })
}
