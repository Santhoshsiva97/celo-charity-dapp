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

    // Proposal Struct to store the details
    struct Proposal {
        uint256 index;
        string name;
        string description;
        address payable owner;
        string image;
        bool isActive;
        uint256 amount;
        uint256 trackAmount;
    }

    // Proposal mapping with the unique ID's
    mapping(uint256 => Proposal) public proposals;

    mapping(uint256 => bool) public _exists;

    // To prevent access permission from 3rd persons
    modifier isProposalOwner(address _address) {
        require(msg.sender == _address, "NOT_A_PROPOSAL_OWNER");
        _;
    }

    // To prevent queries of proposals' ids that do not exist
    modifier exists(uint256 _index) {
        require(_exists[_index], "Query of nonexistent proposal");
        _;
    }

    // To  get total count of the proposals
    function getTotalProposals() public view returns (uint256) {
        return (totalProposals);
    }

    /// @dev Proposal creation function: Input the basic details and store the data
    /// @notice input data needs to contain only valid values
    function createProposal(
        string calldata _name,
        string calldata _description,
        string calldata _image,
        uint256 _amount
    ) public {
        require(bytes(_name).length > 0, "Empty name");
        require(bytes(_description).length > 0, "Empty description");
        require(bytes(_image).length > 0, "Empty image");
        proposals[totalProposals] = Proposal(
            totalProposals,
            _name,
            _description,
            payable(msg.sender), // Proposal creator address
            _image,
            true, // By default proposal is active
            _amount,
            0 // By default track amount is 0
        );
        _exists[totalProposals] = true;
        totalProposals += 1;
    }

    /// @dev Edit Proposal: Modify the details and save the changes made to the proposal
    /// @notice Only the proposal's owner is allowed to do that
    function editProposal(
        uint256 _index,
        string calldata _name,
        string calldata _description,
        string calldata _image,
        uint256 _amount,
        bool _status
    ) public exists(_index) isProposalOwner(proposals[_index].owner) {
        require(bytes(_name).length > 0, "Empty name");
        require(bytes(_description).length > 0, "Empty description");
        require(bytes(_image).length > 0, "Empty image");
        Proposal storage currentProposal = proposals[_index];
        currentProposal.name = _name;
        currentProposal.description = _description;
        currentProposal.image = _image;
        currentProposal.amount = _amount;
        currentProposal.isActive = _status;
    }

    /// @dev Read Proposal: To retrieve the proposal by index
    /// @return Proposal details of a proposal
    function readProposal(uint256 _index)
        public
        view
        exists(_index)
        returns (Proposal memory)
    {
        return (proposals[_index]);
    }

    /// @dev Cancel proposal: Terminate the proposal and remove the proposal's data from the smart contract's state
    function cancelProposal(uint256 _index)
        public
        exists(_index)
        isProposalOwner(proposals[_index].owner)
    {
        uint256 newTotalProposal = totalProposals - 1;
        totalProposals = newTotalProposal;
        proposals[_index] = proposals[newTotalProposal];
        _exists[newTotalProposal] = false;
        delete proposals[newTotalProposal];
    }

    /// @dev Donate: Contributing to proposal and transfer the funds to owner and add amount to the tracking amount
    /// @notice proposal must be active
    function donateProposal(uint256 _index, uint256 _amount)
        external
        payable
        exists(_index)
    {
        Proposal storage currentProposal = proposals[_index];
        require(currentProposal.isActive, "Proposal is not active");
        require(
            currentProposal.owner != msg.sender,
            "You can't donate to your own proposal"
        );
        require(_amount >= 0.01 ether, "Min donation amount is 0.01 cUSD");
        uint256 newTrackAmount = currentProposal.trackAmount + _amount;
        currentProposal.trackAmount = newTrackAmount;
        require(
            IERC20Token(cusdAddress).transferFrom(
                msg.sender,
                currentProposal.owner,
                _amount
            ),
            "Transfer failed"
        );
    }
}
