// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

// Creating the charity contract for helping the NGO's in raising funds for good cause.
contract Charity {
    uint256 internal totalProposals = 0;
    address internal cusdAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address admin = msg.sender;

    // Proposal Struct to store the details
    struct Proposal {
        uint256 index;
        string name;
        string description;
        address payable owner;
        string image;
        bool isActive;
        uint256 amount;
        bool approved;
        uint256 trackAmount;
    }

    // Proposal mapping with the unique ID's
    mapping(uint256 => Proposal) public proposals;

    // To prevent to access permission from 3rd persons
    modifier isProposalOwner(address _address) {
        require(msg.sender == _address, "NOT_A_PROPOSAL_OWNER");
        _;
    }

    // To  get total count of the proposals
    function getTotalProposals() public view returns (uint256) {
        return (totalProposals);
    }

    // Proposal creation function: Get the basic details and store the data
    function createProposal(
        string memory _name,
        string memory _description,
        string memory _image,
        uint256 _amount
    ) public {
        proposals[totalProposals] = Proposal(
            totalProposals,
            _name,
            _description,
            payable(msg.sender), // Proposal creator address
            _image,
            true, // By default proposal is active
            _amount,
            false, // By default proposal is not approved
            0 // By default track amount is 0
        );
        totalProposals += 1;
    }

    // Edit Proposal: Modify the details and save the proposal
    function editProposal(
        uint256 _index,
        string memory _name,
        string memory _description,
        string memory _image,
        uint256 _amount,
        bool _status
    ) public isProposalOwner(proposals[_index].owner) {
        proposals[_index].name = _name;
        proposals[_index].description = _description;
        proposals[_index].image = _image;
        proposals[_index].amount = _amount;
        proposals[_index].isActive = _status;
    }

    // approve a proposal
    function approveOrDisapproveProposal(uint256 index) public {
        require(msg.sender == admin, "Not admin");
        proposals[index].approved = !proposals[index].approved;
    }

    // Read Proposal: To retrive the proposal by index
    function readProposal(uint256 _index)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            address,
            bool,
            uint256,
            bool,
            uint256
        )
    {
        Proposal storage proposal = proposals[_index];
        return (
            proposal.name,
            proposal.description,
            proposal.image,
            proposal.owner,
            proposal.isActive,
            proposal.amount,
            proposal.approved,
            proposal.trackAmount
        );
    }

    // Cancel proposal: Terminate the proposal
    function cancelProposal(uint256 _index)
        public
        isProposalOwner(proposals[_index].owner)
    {
        delete proposals[_index];
    }

    // Donate: Contributing to proposal and transfer the funds to owner and add the tracking amount
    function donateProposal(uint256 _index, uint256 _amount) external payable {
        require(_amount >= 0.01 ether, "Min donation amount is 0.01 cUSD");
        require(proposals[_index].approved == true, "Admin hasnt approved");
        require(
            IERC20Token(cusdAddress).transferFrom(
                msg.sender,
                proposals[_index].owner,
                _amount
            ),
            "Transfer failed"
        );
        proposals[_index].trackAmount += _amount;
    }
}
