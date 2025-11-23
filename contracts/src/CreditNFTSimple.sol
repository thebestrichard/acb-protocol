// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CreditNFTSimple
 * @dev Simplified dynamic NFT that changes based on user's credit score
 * This version uses minimal dependencies for better compatibility
 */
contract CreditNFTSimple {
    string public name = "ACB Credit NFT";
    string public symbol = "ACREDIT";
    
    address public owner;
    address public creditScoreContract;
    uint256 private _nextTokenId = 1;
    
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    // Mapping from owner address to token ID
    mapping(address => uint256) private _userTokens;
    // Mapping from owner to token count
    mapping(address => uint256) private _balances;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event NFTMinted(address indexed user, uint256 indexed tokenId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _creditScoreContract) {
        owner = msg.sender;
        creditScoreContract = _creditScoreContract;
    }
    
    /**
     * @dev Mint a credit NFT for the user
     */
    function mint() external returns (uint256) {
        require(_userTokens[msg.sender] == 0, "Already minted");
        
        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = msg.sender;
        _userTokens[msg.sender] = tokenId;
        _balances[msg.sender] = 1;
        
        emit Transfer(address(0), msg.sender, tokenId);
        emit NFTMinted(msg.sender, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Get token ID for a user
     */
    function tokenOf(address user) external view returns (uint256) {
        return _userTokens[user];
    }
    
    /**
     * @dev Get owner of a token
     */
    function ownerOf(uint256 tokenId) external view returns (address) {
        return _owners[tokenId];
    }
    
    /**
     * @dev Get balance of an address
     */
    function balanceOf(address user) external view returns (uint256) {
        return _balances[user];
    }
    
    /**
     * @dev Check if user has minted
     */
    function hasMinted(address user) external view returns (bool) {
        return _userTokens[user] != 0;
    }
    
    /**
     * @dev Generate SVG based on credit score
     */
    function generateSVG(uint256 score, string memory tier) public pure returns (string memory) {
        string memory color = _getTierColor(tier);
        
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">',
            '<rect width="400" height="400" fill="', color, '" rx="20"/>',
            '<circle cx="200" cy="150" r="60" fill="none" stroke="#fff" stroke-width="6"/>',
            '<text x="200" y="170" font-size="48" fill="#fff" text-anchor="middle">',
            _toString(score), '</text>',
            '<text x="200" y="260" font-size="24" fill="#fff" text-anchor="middle">', tier, '</text>',
            '</svg>'
        ));
    }
    
    function _getTierColor(string memory tier) internal pure returns (string memory) {
        bytes32 tierHash = keccak256(bytes(tier));
        if (tierHash == keccak256(bytes("A"))) return "#10b981";
        if (tierHash == keccak256(bytes("B"))) return "#3b82f6";
        if (tierHash == keccak256(bytes("C"))) return "#f59e0b";
        return "#ef4444";
    }
    
    function _getTierLabel(string memory tier) internal pure returns (string memory) {
        bytes32 tierHash = keccak256(bytes(tier));
        if (tierHash == keccak256(bytes("A"))) return "Tier A - Excellent";
        if (tierHash == keccak256(bytes("B"))) return "Tier B - Good";
        if (tierHash == keccak256(bytes("C"))) return "Tier C - Fair";
        return "Tier D - Poor";
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
