// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";

import "./ERC2981.sol";

contract NFT is AccessControl, ERC2981, ERC721Enumerable, ERC721Burnable, ERC721Pausable {
    event RoyaltyWalletChanged(address indexed previousWallet, address indexed newWallet);
    event RoyaltyFeeChanged(uint256 previousFee, uint256 newFee);
    event BaseURIChanged(string previousURI, string newURI);

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant ROYALTY_FEE_DENOMINATOR = 100000;
    uint256 public royaltyFee;
    address public royaltyWallet;

    string private _baseTokenURI;

    /**
     * @param _name ERC721 token name
     * @param _symbol ERC721 token symbol
     * @param _uri Base token uri
     * @param _royaltyWallet Wallet where royalties should be sent
     * @param _royaltyFee Fee numerator to be used for fees
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri,
        address _royaltyWallet,
        uint256 _royaltyFee
    ) ERC721(_name, _symbol) {
        _setBaseTokenURI(_uri);
        _setRoyaltyWallet(_royaltyWallet);
        _setRoyaltyFee(_royaltyFee);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OWNER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Throws if called by any account other than owners. Implemented using the underlying AccessControl methods.
     */
    modifier onlyOwners() {
        require(hasRole(OWNER_ROLE, _msgSender()), "Caller does not have the OWNER_ROLE");
        _;
    }

    /**
     * @dev Throws if called by any account other than minters. Implemented using the underlying AccessControl methods.
     */
    modifier onlyMinters() {
        require(hasRole(MINTER_ROLE, _msgSender()), "Caller does not have the MINTER_ROLE");
        _;
    }

    /**
     * @dev Mints the specified token id to the recipient addresses
     * @dev The unused string parameter exists to support the API used by ChainBridge.
     * @param recipient Address that will receive the tokens
     * @param tokenId tokenId to be minted
     * @param tokenUri tokenUri to associate with the token - ignored here as uris are derived from the token id and
     * baseuri
     */
    function mint(address recipient, uint256 tokenId, string calldata tokenUri) external onlyMinters {
        _mint(recipient, tokenId);
    }

    /**
     * @dev Pauses token transfers
     */
    function pause() external onlyOwners {
        _pause();
    }

    /**
     * @dev Unpauses token transfers
     */
    function unpause() external onlyOwners {
        _unpause();
    }

    /**
     * @dev Sets the base token URI
     * @param uri Base token URI
     */
    function setBaseTokenURI(string calldata uri) external onlyOwners {
        _setBaseTokenURI(uri);
    }

    /**
     * @dev Sets the wallet to which royalties should be sent
     * @param _royaltyWallet Address that should receive the royalties
     */
    function setRoyaltyWallet(address _royaltyWallet) external onlyOwners {
        _setRoyaltyWallet(_royaltyWallet);
    }

    /**
     * @dev Sets the fee percentage for royalties
     * @param _royaltyFee Basis points to compute royalty percentage
     */
    function setRoyaltyFee(uint256 _royaltyFee) external onlyOwners {
        _setRoyaltyFee(_royaltyFee);
    }

    /**
     * @dev Function defined by ERC2981, which provides information about fees.
     * @param value Price being paid for the token (in base units)
     */
    function royaltyInfo(
        uint256, // tokenId is not used in this case as all tokens take the same fee
        uint256 value
    )
        external
        view
        override
        returns (
            address, // receiver
            uint256 // royaltyAmount
        )
    {
        return (royaltyWallet, (value * royaltyFee) / ROYALTY_FEE_DENOMINATOR);
    }

    /**
     * @dev For each existing tokenId, it returns the URI where metadata is stored
     * @param tokenId Token id
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory uri = super.tokenURI(tokenId);
        return bytes(uri).length > 0 ? string(abi.encodePacked(uri, ".json")) : "";
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC2981, ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _setBaseTokenURI(string memory newURI) internal {
        emit BaseURIChanged(_baseTokenURI, newURI);
        _baseTokenURI = newURI;
    }

    function _setRoyaltyWallet(address _royaltyWallet) internal {
        require(_royaltyWallet != address(0), "INVALID_WALLET");
        emit RoyaltyWalletChanged(royaltyWallet, _royaltyWallet);
        royaltyWallet = _royaltyWallet;
    }

    function _setRoyaltyFee(uint256 _royaltyFee) internal {
        require(_royaltyFee <= ROYALTY_FEE_DENOMINATOR, "INVALID_FEE");
        emit RoyaltyFeeChanged(royaltyFee, _royaltyFee);
        royaltyFee = _royaltyFee;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
