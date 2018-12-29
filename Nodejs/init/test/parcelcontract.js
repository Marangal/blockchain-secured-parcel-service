var ParcelContract = artifacts.require("./ParcelContract.sol");

contract('ParcelContract', function(accounts) {
  it("should have 100 ether ", function() {
    return ParcelContract.deployed().then(function(instance) {
      return instance.accuracyDeliveryAndPickup.call();
    }).then(function(xx) {
      assert.equal(xx, 50, "accuracyDeliveryAndPickup wasn't 50");
    });
  });
});
