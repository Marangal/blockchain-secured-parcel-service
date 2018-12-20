pragma solidity ^0.5.0;

contract Rejector {
    function() external payable  { revert("Rejected by the rejector contract"); }
}