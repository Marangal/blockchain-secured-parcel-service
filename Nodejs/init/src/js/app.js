const parcelLocalStorageVarName = "parcel";
var parcel;

App = {
  web3Provider: null,
  contracts: {},
  parcelContractInstance: null,

  init: async function() {
    var parcel = App.loadParcelData();
    App.updateParcelData(parcel);
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
    // Legacy dapp browsers.....
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
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

      if(parcel.smartContract.address != "") {
        App.contracts.ParcelContract.at(parcel.smartContract.address).then(function(instance) {
          App.parcelContractInstance = instance;
        }).catch(function(err) {
          console.log(err);
        });
      }
    });

    return App.bindEvents();
  },

  saveParcelData: function(parcel) {
    localStorage.setItem(parcelLocalStorageVarName, JSON.stringify(parcel));
  },

  removeParcelData: function() {
    localStorage.removeItem(parcelLocalStorageVarName);
  },
  loadParcelData: function() {
    var parcelData = localStorage.getItem(parcelLocalStorageVarName);
    if(parcelData == null || parcelData == "undefined")
    {
      parcel = {
        title:"Flowers",
        description:"A bundle of flowers for someone special.",
        size:"Small", 
        weight:"Light",
        transportCost: 100,
        platformCost: 10,

        pickupAddress: "Gent",
        pickupLocation: {lat: 51.051990, lng: 3.717397},
        pickupStart: new Date().toJSON(),
        pickupEnd: new Date().toJSON(),
        
        deliveryAddress: "Antwerpen",
        deliveryLocation: {lat: 51.051990, lng: 3.717397},
        deliveryStart: new Date().toJSON(),
        deliveryEnd: new Date().toJSON(),
        
        senderName: "Jonas",
        senderPublicKey: "",
        receiverName: "Dimitri",
        receiverPublicKey: "",
        courierName: "Nicolas",
        courierPublicKey: "",
        smartContract: {
          address: "",
          status : {
            created: false,
            senderSigned: false,
            courierSigned: false,
            receiverSigned: false,
            pickup: false,
            delivered: false
          }
        }
      };
      localStorage.setItem(parcelLocalStorageVarName, JSON.stringify(parcel));

      web3.eth.getAccounts(function(error, accounts) {
        var account = accounts[0];
        parcel.senderPublicKey = account;
        localStorage.setItem(parcelLocalStorageVarName, JSON.stringify(parcel));
      });
    }
    else {
      parcel = JSON.parse(localStorage.getItem(parcelLocalStorageVarName));
    }
    parcel.calculateHash = function() {
      return web3.sha3(parcel.title, parcel.description, parcel.size, parcel.weight);
    };

    parcel.getStatus = function() {
      if(parcel.smartContract.status.delivered) {
        return "Delivered"
      }
      if(parcel.smartContract.status.pickup) {
        return "Picked up"
      }
      if(App.allParticipantsSigned()) {
        return "Signed"
      }
      if(parcel.smartContract.status.created) {
        return "Created"
      }
      if(parcel.courierPublicKey != "") {
        return "Courier ready!"
      }
      if(parcel.courierPublicKey == "") {
        return "waiting for courier"
      }
      return ;
    };

    return parcel;
  },

  loadParcelForm: function() {

    $("#parcel-senderName").val(parcel.senderName);
    $("#parcel-senderPublicKey").val(parcel.senderPublicKey);
    $("#parcel-receiverName").val(parcel.receiverName);
    $("#parcel-receiverPublicKey").val(parcel.receiverPublicKey);
    $("#parcel-courierName").val(parcel.courierName);
    $("#parcel-courierPublicKey").val(parcel.courierPublicKey);

    $("#parcel-title").val(parcel.title);
    $("#parcel-description").val(parcel.description);
    $("#parcel-size").val(parcel.size);
    $("#parcel-weight").val(parcel.weight);
    $("#parcel-transportCost").val(parcel.transportCost);
    $("#parcel-pickup-city").val(parcel.pickupAddress);
    $("#parcel-delivery-city").val(parcel.deliveryAddress);
    
    $("#parcel-pickupStart").val(parcel.pickupStart.slice(0,19));
    $("#parcel-pickupEnd").val(parcel.pickupEnd.slice(0,19));
    $("#parcel-deliveryStart").val(parcel.deliveryStart.slice(0,19));
    $("#parcel-deliveryEnd").val(parcel.deliveryEnd.slice(0,19));

    pickupMap.setCenter(parcel.pickupLocation);
    deliveryMap.setCenter(parcel.deliveryLocation);
    
    if(pickupMarker != null) {
      pickupMarker.setMap(null);
    }
    if(deliveryMarker != null) {
      deliveryMarker.setMap(null);
    }

    pickupMarker = new google.maps.Marker({
      position: parcel.pickupLocation,
      map: pickupMap
    });
    deliveryMarker = new google.maps.Marker({
      position: parcel.deliveryLocation,
      map: deliveryMap
    });
    App.showParcelForm();
  },
  removeParcelData: function() {
    localStorage.removeItem(parcelLocalStorageVarName);
    location.reload();
  },
  saveParcelForm: function() {
    parcel.senderName = $("#parcel-senderName").val();
    parcel.senderPublicKey = $("#parcel-senderPublicKey").val();
    parcel.receiverName = $("#parcel-receiverName").val();
    parcel.receiverPublicKey = $("#parcel-receiverPublicKey").val();

    parcel.title = $("#parcel-title").val();
    parcel.description = $("#parcel-description").val();
    parcel.size = $("#parcel-size").val();
    parcel.weight = $("#parcel-weight").val();
    parcel.transportCost = $("#parcel-transportCost").val();
    parcel.pickupAddress = $("#parcel-pickup-city").val();
    parcel.deliveryAddress = $("#parcel-delivery-city").val();
    
    if(tempDeliveryLocation !== undefined)
      parcel.deliveryLocation = tempDeliveryLocation;
    if(tempPickupLocation !== undefined)
      parcel.pickupLocation = tempPickupLocation;

    parcel.pickupStart = $("#parcel-pickupStart").val();
    parcel.pickupEnd = $("#parcel-pickupEnd").val();
    parcel.deliveryStart = $("#parcel-deliveryStart").val();
    parcel.deliveryEnd = $("#parcel-deliveryEnd").val();

    App.saveParcelData(parcel);
    location.reload();
  },

  updateParcelData: function(parcel) {
    $(".parcel-title").html(parcel.title);
    $(".parcel-size").html(parcel.size);
    $(".parcel-weight").html(parcel.weight);
    $(".parcel-transportCost").html(parcel.transportCost);
    $(".parcel-pickupAddress").html(parcel.pickupAddress);
    $(".parcel-deliveryAddress").html(parcel.deliveryAddress);
    $(".parcel-status").html(parcel.getStatus());
  },

  bindEvents: function() {
    $(document).on('click', '.btn-createParcelContract', App.createParcelContract);
    $(document).on('click', '.btn-sign', App.signContract);
    /*$(document).on('click', '.btn-unsign', App.unsign); */
    $(document).on('click', '.btn-pickup', App.pickupParcel);
    $(document).on('click', '.btn-delivered', App.deliveredParcel);
    /*$(document).on('click', '.btn-deliveredToSender', App.deliveredToSender);
    $(document).on('click', '.btn-readyForPickup', App.readyForPickup);
    $(document).on('click', '.btn-readyForDelivery', App.readyForDelivery);*/
    $(document).on('click', '.btn-viewDetails', App.viewDetails);
    $(document).on('click', '.btn-viewEventsDetails', App.viewEventsDetails);
    $(document).on('click', '.btn-viewPickupDeliveryDetails', App.viewPickupAndDeliveryDetails);
    

    $(document).on('click', '.btn-parcel-volunteer', App.saveCourierToParcel);
    $(document).on('click', '.btn-parcel-view', App.loadParcelForm);
    $(document).on('click', '.btn-save-parcel-data', App.saveParcelForm);
    $(document).on('click', '.btn-reset-parcel-data', App.removeParcelData);
    $(document).on('click', '.btn-cancel-parcel-data', App.hideParcelForm);
  },
  setUserDetails: function() {
    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0].toLowerCase();
      if(account == "") {
        $(".no-metamask-account").removeClass("collapse");
        $(".metamask-account").addClass("collapse");
      } else {
        $(".no-metamask-account").addClass("collapse");
        $(".metamask-account").removeClass("collapse");
        
        if(account == parcel.senderPublicKey.toLowerCase()) {
          $(".metamask-account-username").html(parcel.senderName + " as sender");
        }
        else if(account == parcel.courierPublicKey.toLowerCase()) {
          $(".metamask-account-username").html(parcel.courierName + " as courier");
        }
        else if(account == parcel.receiverPublicKey.toLowerCase()) {
          $(".metamask-account-username").html(parcel.receiverName + " as receiver");
          return;
        }
        else {
          $(".metamask-account-username").html("unknown user");
        }
      }
    });
  },
  activateAction: function() {
    $(".btn-createParcelContract").attr("disabled", "disabled");
    $(".btn-sign").attr("disabled", "disabled");
    $(".btn-pickup").attr("disabled", "disabled");
    $(".btn-delivered").attr("disabled", "disabled");
    $(".btn-parcel-volunteer").attr("disabled", "disabled");

    if(parcel.courierPublicKey == "") {
      $(".btn-parcel-volunteer").removeAttr("disabled");
    }

    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0].toLowerCase();
      if(parcel.senderPublicKey.toLowerCase() == account) {
        if(!parcel.smartContract.status.created) {
          $(".btn-createParcelContract").removeAttr("disabled");
        }
        if(!parcel.smartContract.status.senderSigned && parcel.smartContract.status.created) {
          $(".btn-sign").removeAttr("disabled");
        }
      } 
      if(parcel.courierPublicKey.toLowerCase() == account) {
        if(!parcel.smartContract.status.courierSigned && parcel.smartContract.status.created) {
          $(".btn-sign").removeAttr("disabled");
        }
        if(App.allParticipantsSigned() && parcel.smartContract.status.created && !parcel.smartContract.status.pickup) {
          $(".btn-pickup").removeAttr("disabled");
        }
      } 
      if(parcel.receiverPublicKey.toLowerCase() == account) {
        if(!parcel.smartContract.status.receiverSigned && parcel.smartContract.status.created) {
          $(".btn-sign").removeAttr("disabled");
        }
        if(App.allParticipantsSigned() && parcel.smartContract.status.created && parcel.smartContract.status.pickup && !parcel.smartContract.status.delivered) {
          $(".btn-delivered").removeAttr("disabled");
        }
      }
    });
  },

  allParticipantsSigned: function() {
    return (parcel.smartContract.status.senderSigned && parcel.smartContract.status.courierSigned && parcel.smartContract.status.receiverSigned)
  },

  saveCourierToParcel: function() {
    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      parcel.courierPublicKey = account;
      App.saveParcelData(parcel);
      location.reload();
    });
  },
  showParcelForm: function() {
    $("#selectedParcel").removeClass("collapse");
    $("#selectedParcel").addClass("visible");
  },
  hideParcelForm: function() {
    $("#selectedParcel").removeClass("visible");
    $("#selectedParcel").addClass("collapse");
  },

  createParcelContract: function() {
    var accuracyDeliveryAndPickup = 50;
    
    web3.eth.getAccounts(function(error, accounts) {
      
      var sender = accounts[0];
      App.contracts.ParcelContract.new(
        parcel.senderPublicKey, 
        parcel.senderPublicKey, 
        parcel.courierPublicKey, 
        parcel.receiverPublicKey, 
        parcel.calculateHash(), 
        Number(parcel.transportCost), 
        Number(parcel.platformCost),
        Number(parcel.deliveryLocation.lng * 1000000), // to remove the point.
        Number(parcel.deliveryLocation.lat * 1000000), // to remove the point.
        Number(parcel.pickupLocation.lng * 1000000), // to remove the point.
        Number(parcel.pickupLocation.lat * 1000000), // to remove the point.
        accuracyDeliveryAndPickup,
        ((new Date(parcel.deliveryStart)).getTime() / 1000), // seconds
        ((new Date(parcel.deliveryEnd)).getTime() / 1000), // seconds
        // ((new Date(parcel.deliveryEnd)).getTime() * 1000) + 621355968000000000, // ticks
        ((new Date(parcel.pickupStart)).getTime() / 1000), // seconds
        ((new Date(parcel.pickupEnd)).getTime() / 1000), // seconds
      ).then(function(instance) {
        App.parcelContractInstance = instance;
        parcel.smartContract.address = App.parcelContractInstance.address;
        parcel.smartContract.status.created = true;
        App.saveParcelData(parcel);
        console.log("parcelContract instance address:" + App.parcelContractInstance.address);

        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  signContract: function() {
    
    var transportCost = Number(parcel.transportCost);
    var platformCost = Number(parcel.platformCost);
    var wei = 0;
    if(parcel.smartContract.address === "")
      return;

    web3.eth.getAccounts(function(error, accounts) {
      
      var account = accounts[0];
      if(account == parcel.senderPublicKey.toLowerCase())
        wei = transportCost + platformCost;
      var parcelContractInstance;
      App.parcelContractInstance.sign({to:App.parcelContractInstance.address, from: account, value: wei })
      .then(function(result) {
        if(account == parcel.courierPublicKey.toLowerCase()) {
          parcel.smartContract.status.courierSigned = true;
        }
        if(account == parcel.senderPublicKey.toLowerCase()) {
          parcel.smartContract.status.senderSigned = true;
        }
        if(account == parcel.receiverPublicKey.toLowerCase()) {
          parcel.smartContract.status.receiverSigned = true;
        }
        App.saveParcelData(parcel);

        console.log("result:"+result);
        console.log("result.logs:" + result.logs);
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  pickupParcel: function() {
    if(parcel.smartContract.address === "")
      return;

    web3.eth.getAccounts(function(error, accounts) {
      
      var account = accounts[0];
      App.parcelContractInstance.pickup({to:App.parcelContractInstance.address, from: account})
      .then(function(result) {
        parcel.smartContract.status.pickup = true;
        App.saveParcelData(parcel);

        console.log("result:"+result);
        console.log("result.logs:" + result.logs);
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  deliveredParcel: function() {
    if(parcel.smartContract.address === "")
      return;

    web3.eth.getAccounts(function(error, accounts) {
      
      var account = accounts[0];
      App.parcelContractInstance.delivered({to:App.parcelContractInstance.address, from: account})
      .then(function(result) {
        parcel.smartContract.status.delivered = true;
        App.saveParcelData(parcel);

        console.log("result:"+result);
        console.log("result.logs:" + result.logs);
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  viewDetails: function() {
    if(parcel.smartContract.address === "")
      return;

    web3.eth.getAccounts(function(error, accounts) {
      
      
      App.parcelContractInstance.readDetails.call()
      .then(function(result) {

        $(".blockchain-version").html(App.toAscii(result[0]));
        $(".blockchain-accuracyDeliveryAndPickup").html(Number(result[1]));
        $(".blockchain-platformCost").html(Number(result[2]));
        $(".blockchain-sender").html(result[3]);
        $(".blockchain-courier").html(result[4]);
        $(".blockchain-receiver").html(result[5]);
        $(".blockchain-transportCost").html(Number(result[6]));
        $(".blockchain-weiLockedBySender").html(Number(result[7]));
        $(".blockchain-parcelHash").html(result[8]);
        
        $(".blockchain-events-details").addClass("collapse");
        $(".blockchain-details").removeClass("collapse");
        $(".blockchain-pickup-delivery-details").addClass("collapse");
        console.log("result:"+result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  viewEventsDetails: function() {
    if(parcel.smartContract.address === "")
      return;

    web3.eth.getAccounts(function(error, accounts) {
      
      var account = accounts[0];
      App.parcelContractInstance.readMainEvents.call()
      .then(function(result) {

        $(".blockchain-senderSigned").html(result[0]);
        $(".blockchain-senderSignedTimeStamp").html(App.secondstoDateTime(result[1]).toLocaleString());
        $(".blockchain-courierSigned").html(result[2]);
        $(".blockchain-courierSignedTimeStamp").html(App.secondstoDateTime(result[3]).toLocaleString());
        $(".blockchain-receiverSigned").html(result[4]);
        $(".blockchain-receiverSignedTimeStamp").html(App.secondstoDateTime(result[5]).toLocaleString());
        $(".blockchain-pickupTimeStamp").html(App.secondstoDateTime(result[6]).toLocaleString());
        $(".blockchain-deliveredTimeStamp").html(App.secondstoDateTime(result[7]).toLocaleString());
        $(".blockchain-deliveredToSenderTimeStamp").html("");
        

        $(".blockchain-events-details").removeClass("collapse");
        $(".blockchain-details").addClass("collapse");
        $(".blockchain-pickup-delivery-details").addClass("collapse");
        console.log("result:"+result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  viewPickupAndDeliveryDetails: function() {
    if(parcel.smartContract.address === "")
      return;

    web3.eth.getAccounts(function(error, accounts) {
      
      var account = accounts[0];
      App.parcelContractInstance.readPickupAndDeliveryDetails.call().then(function(result) {

        $(".blockchain-deliveryStart").html(App.secondstoDateTime(Number(result[0])).toLocaleString());
        $(".blockchain-deliveryEnd").html(App.secondstoDateTime(Number(result[1])).toLocaleString());
        $(".blockchain-pickupStart").html(App.secondstoDateTime(Number(result[2])).toLocaleString());
        $(".blockchain-pickupEnd").html(App.secondstoDateTime(Number(result[3])).toLocaleString());
        $(".blockchain-deliveryLatitude").html(Number(result[4]) / 1000000);
        $(".blockchain-deliveryLongitude").html(Number(result[5]) / 1000000);
        $(".blockchain-pickupLatitude").html(Number(result[6]) / 1000000);
        $(".blockchain-pickupLongitude").html(Number(result[7]) / 1000000);
        
        $(".blockchain-events-details").addClass("collapse");
        $(".blockchain-details").addClass("collapse");
        $(".blockchain-pickup-delivery-details").removeClass("collapse");
        
        console.log("result:"+result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  toAscii: function (data) {
    return web3.toAscii(data).replace(/\0/g, '');
  },
  secondstoDateTime: function (secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}
};


$(function() {
  //var MongoClient = require('mongodb');
  //import toppo from 'mongodb';
  
  $(window).load(function() {
    App.init();
    App.activateAction();
    App.setUserDetails();
  });
});

