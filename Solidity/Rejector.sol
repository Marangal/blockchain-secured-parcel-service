pragma solidity ^0.4.24;

contract Rejector {
    function() external payable  { revert("Rejected by the rejector contract"); }
}