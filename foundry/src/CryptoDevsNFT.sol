// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CryptoDevsNFT is ERC721Enumerable {
    // initilizing ERC721 contract
    constructor() ERC721("CryptoDevs", "CD") {}

    // Anyone can Mint NFT
    function mint() public {
        _safeMint(msg.sender, totalSupply());
    }
}
