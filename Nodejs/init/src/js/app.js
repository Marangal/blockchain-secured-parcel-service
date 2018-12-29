App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://172.31.27.134:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('ParcelContract.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ParcelContractArtifact = data;
      App.contracts.ParcelContract = TruffleContract(ParcelContractArtifact);
    
      // Set the provider for our contract
      App.contracts.ParcelContract.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      //return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-createParcelContract', App.createParcelContract);
    $(document).on('click', '.btn-sign', App.signContract);
    /*$(document).on('click', '.btn-unsign', App.unsign);
    $(document).on('click', '.btn-pickup', App.pickup);
    $(document).on('click', '.btn-delivered', App.delivered);
    $(document).on('click', '.btn-deliveredToSender', App.deliveredToSender);
    $(document).on('click', '.btn-readyForPickup', App.readyForPickup);
    $(document).on('click', '.btn-readyForDelivery', App.readyFprDelivery);
    $(document).on('click', '.btn-viewDetails', App.viewDetails);
    */
  },

  createParcelContract: function() {
    
    var courier = $("#courier").val();
    var receiver = $("#receiver").val();
    var parcelHash = $("#parcelHash").val();

    var transportCost = Number($("#transportCost").val());
    var platformCost = Number($("#platformCost").val());

    var deliveryLongitude = Number($("#deliveryLongitude").val());
    var deliveryLatitude = Number($("#deliveryLatitude").val());
    var pickupLongitude = Number($("#pickupLongitude").val());
    var pickupLatitude = Number($("#pickupLatitude").val());
    var accuracyDeliveryAndPickup = 50;
    var deliveryStart = Number($("#deliveryStart").val()); 
    var deliveryEnd = Number($("#deliveryEnd").val()); 
    var pickupStart = Number($("#pickupStart").val()); 
    var pickupEnd = Number($("#pickupEnd").val()); 
    
    web3.eth.getAccounts(function(error, accounts) {
      
      var sender = accounts[0];
      var parcelContractInstance;
      App.contracts.ParcelContract.new(
        sender, 
        sender, 
        courier, 
        receiver, 
        parcelHash, 
        transportCost, platformCost, 
        deliveryLongitude, deliveryLatitude, 
        pickupLongitude, pickupLatitude, 
        accuracyDeliveryAndPickup, 
        deliveryStart, deliveryEnd, 
        pickupStart, pickupEnd).then(function(instance) {

        parcelContractInstance = instance;
        $("#newAddress").val(parcelContractInstance.address);
        console.log("parcelContract instance address:" + parcelContractInstance.address);
      }).then(function(result) {
        console.log("result:"+result);
        console.log("result.logs:" + result.logs);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  signContract: function() {
    
    var transportCost = Number($("#transportCost").val());
    var platformCost = Number($("#platformCost").val());
    var parcelContractAddress = $("#newAddress").val();
    web3.eth.getAccounts(function(error, accounts) {
      
      var account = accounts[0];
      var parcelContractInstance;
      App.contracts.ParcelContract.at(parcelContractAddress).then(function(instance) {
        parcelContractInstance = instance;
        console.log("parcelContract instance address:" + parcelContractInstance.address);
        
        return parcelContractInstance.sign({to:parcelContractInstance.address, from: account, value: transportCost + platformCost });
        //return parcelContractInstance.senderSigned.call();
      }).then(function(result) {
        console.log("result:"+result);
        console.log("result.logs:" + result.logs);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
