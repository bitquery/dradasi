//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows to mint rental NFT
 * @author BuidlGuidl
 */

interface RentalContract {
    function mint(address, uint256, bytes memory) external;
}

contract Rental {

    // State Variables
    address public immutable owner;
    address internal rentalContractAddress = 0x29401915801E91D1a2345973924321bFeB58a300;
    RentalContract rentalContract = RentalContract(rentalContractAddress);
    address payable public Sender;


    


    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }


    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() isOwner public {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }
 
    function rental( uint256 id, bytes memory data )  public payable{
        require(msg.value == 1 , "Not exact 1 wei value");
        rentalContract.mint( msg.sender , id, data);
    } 

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
