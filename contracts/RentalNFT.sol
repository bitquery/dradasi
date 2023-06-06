// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


  /**
   * @title RentalToken
   * @dev ContractDescription
   * @custom:dev-run-script RentalNFT.sol
   */

contract RentalNFT is ERC1155, Ownable  {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC1155("Rental Token v1") {}


    function mint(address account, uint256 id,  bytes memory data)
        public
        onlyOwner returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(account, id, 1, data);
        return newItemId;

    }

}
