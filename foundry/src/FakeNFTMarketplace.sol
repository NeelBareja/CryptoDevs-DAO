// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FakeNFTMarketplace {
    /// Mapping for fake token id to Owner Address
    mapping(uint256 => address) public tokens;

    /// FakeNFT price
    uint256 nftPrice = 0.01 ether;

    /// accepts ETH and marks the owner of the tokenid as the caller address
    function purchase(uint256 _tokenId) external payable {
        require(msg.value == nftPrice, "This NFT cost 0.01 ether");
        tokens[_tokenId] = msg.sender;
    }

    /// returns the price of one NFT
    function getPrice() external view returns (uint256) {
        return nftPrice;
    }

    /// checks weather the given tokenId has already sold or not
    function available(uint256 _tokenId) external view returns (bool) {
        if (tokens[_tokenId] == address(0)) {
            return true;
        }
        return false;
    }
}
