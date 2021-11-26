const timeMachine = require('ganache-time-traveler')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const { expect } = chai

const NFT = artifacts.require('NFT')

contract('NFT', (accounts) => {
  const [_, owner, wallet, anyone] = accounts

  let snapshotId
  beforeEach(async () => {
    const snapshot = await timeMachine.takeSnapshot()
    snapshotId = snapshot['result']
  })

  afterEach(async () => {
    await timeMachine.revertToSnapshot(snapshotId)
  })

  describe('EIP165', () => {
    let nft
    beforeEach(async () => {
      nft = await NFT.new('', '', '', wallet, 0, { from: owner })
    })

    it('supports the correct interface', async () => {
      const interfaceId = '0x2a55205a'
      const result = await nft.supportsInterface(interfaceId)
      expect(result).to.be.true
    })
  })

  describe('EIP2981', () => {
    let nft
    const initialFee = 100 // 100/100000 = 0,1%

    beforeEach(async () => {
      nft = await NFT.new('', '', '', wallet, initialFee, { from: owner })
    })

    it('returns the royalty info correctly', async () => {
      const value = 100000
      const info = await nft.royaltyInfo(0, value)
      expect(info).to.exist
      expect(info[0]).to.equal(wallet)
      expect(info[1].toNumber()).to.equal((value * initialFee) / 100000)
    })

    describe('setRoyaltyWallet', () => {
      it('sets the wallet correctly', async () => {
        const { logs } = await nft.setRoyaltyWallet(anyone, { from: owner })
        expect(logs).to.have.length(1)
        expect(logs[0].event).to.equal('RoyaltyWalletChanged')
        expect(logs[0].args.previousWallet).to.equal(wallet)
        expect(logs[0].args.newWallet).to.equal(anyone)

        const stored = await nft.royaltyWallet()
        expect(stored).to.equal(anyone)
      })

      it('reverts if not the owner', async () => {
        await expect(nft.setRoyaltyWallet(anyone, { from: anyone })).rejectedWith('Caller does not have the OWNER_ROLE')
      })

      it('reverts if setting address(0)', async () => {
        const zeroAddress = '0x0000000000000000000000000000000000000000'
        await expect(nft.setRoyaltyWallet(zeroAddress, { from: owner })).rejectedWith('INVALID_WALLET')
      })
    })

    describe('setRoyaltyFee', () => {
      it('sets the fee correctly', async () => {
        const fee = 123
        const { logs } = await nft.setRoyaltyFee(fee, { from: owner })
        expect(logs).to.have.length(1)
        expect(logs[0].event).to.equal('RoyaltyFeeChanged')
        expect(logs[0].args.previousFee.toNumber()).to.equal(initialFee)
        expect(logs[0].args.newFee.toNumber()).to.equal(fee)

        const stored = await nft.royaltyFee()
        expect(stored.toNumber()).to.equal(fee)
      })

      it('reverts if not the owner', async () => {
        await expect(nft.setRoyaltyFee(123, { from: anyone })).rejectedWith('Caller does not have the OWNER_ROLE')
      })

      it('reverts if fee is higher than the denominator', async () => {
        await expect(nft.setRoyaltyFee(100001, { from: owner })).rejectedWith('INVALID_FEE')
      })
    })
  })

  describe('Base URI', () => {
    let nft
    beforeEach(async () => {
      nft = await NFT.new('', '', '', wallet, 0, { from: owner })
    })

    it('sets the base URI correctly', async () => {
      const baseURI = 'test'
      const tokenId = 10
      const { logs } = await nft.setBaseTokenURI(baseURI, { from: owner })
      expect(logs).to.have.length(1)
      expect(logs[0].event).to.equal('BaseURIChanged')
      expect(logs[0].args.previousURI).to.equal('')
      expect(logs[0].args.newURI).to.equal(baseURI)

      await nft.mint(anyone, [tokenId], '', { from: owner })
      const uri = await nft.tokenURI(tokenId)
      expect(uri).to.equal(`${baseURI}${tokenId}.json`)
    })

    it('reverts if not the owner', async () => {
      await expect(nft.setBaseTokenURI('test', { from: anyone })).rejectedWith('Caller does not have the OWNER_ROLE')
    })

    it('returns empty if base uri is not set', async () => {
      const tokenId = 10
      await nft.mint(anyone, [tokenId], '', { from: owner })
      const uri = await nft.tokenURI(tokenId)
      expect(uri).to.equal('')
    })

    it('reverts if nft does not exist', async () => {
      await expect(nft.tokenURI(0)).rejectedWith('ERC721Metadata: URI query for nonexistent token')
    })
  })

  describe('Pausable', () => {
    let nft
    beforeEach(async () => {
      nft = await NFT.new('', '', '', wallet, 0, { from: owner })
    })

    it('makes transfers revert if paused', async () => {
      const tokenId = 10
      await nft.mint(anyone, [tokenId], '', { from: owner })
      await nft.pause({ from: owner })
      // Transfer token from anyone to owner
      await expect(nft.transferFrom(anyone, owner, tokenId, { from: anyone })).rejectedWith(
        'ERC721Pausable: token transfer while paused.'
      )
    })

    it('supports unpausing transfers', async () => {
      const tokenId = 10
      await nft.mint(anyone, [tokenId], '', { from: owner })
      await nft.pause({ from: owner })
      await nft.unpause({ from: owner })
      // Transfer token from anyone to owner, we just check it doesn't revert
      await expect(nft.transferFrom(anyone, owner, tokenId, { from: anyone })).to.eventually.exist
    })

    it('reverts if (un)pausing with address different to owner', async () => {
      await expect(nft.pause({ from: anyone })).rejectedWith('Caller does not have the OWNER_ROLE')
      await expect(nft.unpause({ from: anyone })).rejectedWith('Caller does not have the OWNER_ROLE')
    })
  })
})
