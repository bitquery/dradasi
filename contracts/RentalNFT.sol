// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


  /**
   * @title RentalToken
   * @dev ContractDescription
   * @custom:dev-run-script RentalNFT.sol
   */

contract RentalNFT is ERC721, Ownable  {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("DRADASI Token v1", "DRADASI") {}

    function mint(address account,  uint256 id)
        public
        onlyOwner returns (uint256)
    {
        _mint(account, id);
        return id;

    }

}
