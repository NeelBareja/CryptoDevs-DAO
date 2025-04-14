// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketplace {
    /// return the price of NFT from FakeMarketplace
    /// retunrs the price in Wei
    function getPrice() external view returns (uint256);

    /// retuens the given token has already Purchased the NFT
    function available(uint256 _tokenId) external view returns (bool);

    /// purchase from FakeMarket place
    function purchase(uint256 _tokenId) external payable;
}

interface ICryptoDevsNFT {
    /// returns the number of NFT own by the given address
    /// need address to fetch the NFT tokenID
    /// returns the number of NFT owns
    function balanceOf(address Owner) external view returns (uint256);

    /// returns a tokenId at given index for owner
    /// address fetch NFT tokenID
    /// retunrs the tokenID for NFT
    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) external view returns (uint256);
}

contract CryptoDevsDAO is Ownable {
    struct Proposal {
        // tokenId of the NFT to purchase from FakeNFTMarketplace if the proposal Passed
        uint256 nftTokenId;
        // unix timestamp unit this the proposal is active, it passes after this exceeds
        uint256 deadline;
        // numberof yes votes
        uint256 yesVotes;
        // number of no votes
        uint256 noVotes;
        // to check wheather or not perticular proposal is excuted or not, can check only after deadline exceeds
        bool executed;
        // to check the NFT has voted or not
        mapping(uint256 => bool) voters;
    }

    // Create a mapping of ID to Proposal
    mapping(uint256 => Proposal) public proposals;
    // Number of proposals that have been created
    uint256 public numProposals;

    IFakeNFTMarketplace nftMarketPlace;
    ICryptoDevsNFT cryptoDevsNFT;

    constructor(
        address _nftMarketplace,
        address _cryptoDevsNFT
    ) payable Ownable(msg.sender) {
        nftMarketPlace = IFakeNFTMarketplace(_nftMarketplace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "Not A DAO Member");
        _;
    }

    /// allows a CryptoDevNFT holder to create a new proposal
    /// tokenId of the NFT to be purchased if the proposal Passes
    /// retuns the index of the proposal
    function createProposal(
        uint256 _nftTokenID
    ) external nftHolderOnly returns (uint256) {
        require(nftMarketPlace.available(_nftTokenID), "NFT NOT FOR SALE");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenID;
        // proposal current time + 5 min
        proposal.deadline = block.timestamp + 5 minutes;
        numProposals++;

        return numProposals - 1;
    }

    //modifier for not vote after time exceeds
    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "DEADLIINE EXCEEDED"
        );
        _;
    }

    // for having only two possible option for vote
    enum Vote {
        YES,
        NO
    }

    // to vote on active proposals
    // the index of proposal to vote
    // to cast the vote
    function voteOnProposal(
        uint256 proposalIndex,
        Vote vote
    ) external nftHolderOnly activeProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];

        uint256 voteNFTBalance = cryptoDevsNFT.balanceOf(msg.sender);
        uint256 numVotes = 0;

        /// how many NFTs are own by the voter
        /// which is not has been not used for casing vote
        for (uint256 i = 0; i < voteNFTBalance; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (proposal.voters[tokenId] == false) {
                numVotes++;
                proposal.voters[tokenId] = true;
            }
        }
        require(numVotes > 0, "ALREADY VOTED");

        if (vote == Vote.YES) {
            proposal.yesVotes += numVotes;
        } else {
            proposal.noVotes += numVotes;
        }
    }

    // modifier for the proposal that is not executed even after its deadline is exceeded
    modifier inactiveProposalOnly(uint256 proposalIdex) {
        require(
            proposals[proposalIdex].deadline <= block.timestamp,
            "Deadline is not exceeded"
        );

        require(
            proposals[proposalIdex].executed == false,
            "Proposal is already executed"
        );

        _;
    }

    /// anyone with CryproDevsNFT holder can execute the proposal after deadline
    function executeProposal(
        uint256 proposalIndex
    ) external nftHolderOnly inactiveProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];
        // if proposal has more yes than no
        // purchase NFT from FakeNFTMarket
        if (proposal.yesVotes > proposal.noVotes) {
            uint256 nftPrice = nftMarketPlace.getPrice();
            require(address(this).balance >= nftPrice, "Not Enough Funds");
            nftMarketPlace.purchase{value: nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }

    /// to withdraw ETH from contract
    function withdrawEther() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance empty");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "FAILED_TO_WITHDRAW_ETHER");
    }

    receive() external payable {}

    fallback() external payable {}
}
