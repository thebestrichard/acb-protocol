// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

interface ICreditScore {
    function getScore(address user) external view returns (uint256);
    function getTier(address user) external view returns (string memory);
}

/**
 * @title CreditNFT
 * @dev Dynamic NFT that changes based on user's credit score
 * NFT visual and metadata update automatically when credit score changes
 */
contract CreditNFT is ERC721, Ownable {
    using Strings for uint256;

    ICreditScore public creditScoreContract;
    uint256 private _nextTokenId;
    
    // Mapping from user address to token ID
    mapping(address => uint256) public userToToken;
    // Mapping from token ID to user address
    mapping(uint256 => address) public tokenToUser;

    event NFTMinted(address indexed user, uint256 indexed tokenId, uint256 creditScore);
    event NFTUpdated(uint256 indexed tokenId, uint256 newCreditScore);

    constructor(address _creditScoreContract) ERC721("ACB Credit NFT", "ACREDIT") Ownable(msg.sender) {
        creditScoreContract = ICreditScore(_creditScoreContract);
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a credit NFT for the user
     * Each user can only have one credit NFT
     */
    function mint() external returns (uint256) {
        require(userToToken[msg.sender] == 0, "User already has a credit NFT");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        userToToken[msg.sender] = tokenId;
        tokenToUser[tokenId] = msg.sender;
        
        uint256 creditScore = creditScoreContract.getScore(msg.sender);
        emit NFTMinted(msg.sender, tokenId, creditScore);
        
        return tokenId;
    }

    /**
     * @dev Get the token ID for a user
     */
    function getTokenId(address user) external view returns (uint256) {
        return userToToken[user];
    }

    /**
     * @dev Generate SVG image based on credit score
     */
    function generateSVG(uint256 creditScore, string memory tier) internal pure returns (string memory) {
        // Color scheme based on credit tier
        string memory primaryColor;
        string memory secondaryColor;
        string memory tierLabel;
        
        if (keccak256(bytes(tier)) == keccak256(bytes("A"))) {
            primaryColor = "#10b981"; // Green
            secondaryColor = "#34d399";
            tierLabel = "Tier A - Excellent";
        } else if (keccak256(bytes(tier)) == keccak256(bytes("B"))) {
            primaryColor = "#3b82f6"; // Blue
            secondaryColor = "#60a5fa";
            tierLabel = "Tier B - Good";
        } else if (keccak256(bytes(tier)) == keccak256(bytes("C"))) {
            primaryColor = "#f59e0b"; // Orange
            secondaryColor = "#fbbf24";
            tierLabel = "Tier C - Fair";
        } else {
            primaryColor = "#ef4444"; // Red
            secondaryColor = "#f87171";
            tierLabel = "Tier D - Poor";
        }

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', primaryColor, ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:', secondaryColor, ';stop-opacity:1" />',
            '</linearGradient>',
            '<filter id="glow">',
            '<feGaussianBlur stdDeviation="4" result="coloredBlur"/>',
            '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>',
            '</filter>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#bg)" rx="20"/>',
            '<circle cx="200" cy="150" r="80" fill="none" stroke="white" stroke-width="4" opacity="0.3"/>',
            '<circle cx="200" cy="150" r="60" fill="none" stroke="white" stroke-width="6" filter="url(#glow)"/>',
            '<text x="200" y="165" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">',
            creditScore.toString(),
            '</text>',
            '<text x="200" y="260" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">',
            tierLabel,
            '</text>',
            '<text x="200" y="300" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.8">',
            'ACB Credit Score',
            '</text>',
            '<text x="200" y="360" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.6">',
            'Dynamic NFT - Updates with your credit',
            '</text>',
            '</svg>'
        ));
    }

    /**
     * @dev Generate token URI with dynamic metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenToUser[tokenId] != address(0), "Token does not exist");
        
        address user = tokenToUser[tokenId];
        uint256 creditScore = creditScoreContract.getScore(user);
        string memory tier = creditScoreContract.getTier(user);
        
        string memory svg = generateSVG(creditScore, tier);
        string memory svgBase64 = Base64.encode(bytes(svg));
        
        string memory json = string(abi.encodePacked(
            '{',
            '"name": "ACB Credit Score #', tokenId.toString(), '",',
            '"description": "Dynamic NFT representing your credit score in ACB Protocol. This NFT updates automatically as your credit score changes.",',
            '"image": "data:image/svg+xml;base64,', svgBase64, '",',
            '"attributes": [',
            '{"trait_type": "Credit Score", "value": ', creditScore.toString(), '},',
            '{"trait_type": "Credit Tier", "value": "', tier, '"},',
            '{"trait_type": "Protocol", "value": "ACB"},',
            '{"trait_type": "Type", "value": "Dynamic"}',
            ']',
            '}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    /**
     * @dev Override transfer to prevent NFT trading
     * Credit NFTs are soulbound and cannot be transferred
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but prevent transfers
        if (from != address(0) && to != address(0)) {
            revert("Credit NFTs are soulbound and cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Update credit score contract address
     */
    function updateCreditScoreContract(address _creditScoreContract) external onlyOwner {
        creditScoreContract = ICreditScore(_creditScoreContract);
    }

    /**
     * @dev Check if user has minted NFT
     */
    function hasMinted(address user) external view returns (bool) {
        return userToToken[user] != 0;
    }
}
