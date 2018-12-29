var Rejector = artifacts.require("./Rejector.sol");
var Ownable = artifacts.require("./Ownable.sol");
var ParcelContract = artifacts.require("./ParcelContract.sol");

module.exports = function(deployer) {
  deployer.deploy(Rejector);
  deployer.deploy(Ownable);
  deployer.link(Rejector, ParcelContract);
  deployer.link(Ownable, ParcelContract);
  /*deployer.deploy(ParcelContract, 
    "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 
    "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 
    "0x14723a09acff6d2a60dcdf7aa4aff308fddc160c", 
    "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 
    "0x70617263656c48617368", 100, 10, 1, 1, 2, 2, 50, 10, 20, 30,40
  );*/
};
