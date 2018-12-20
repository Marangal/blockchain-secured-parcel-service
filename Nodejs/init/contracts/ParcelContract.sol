pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./Rejector.sol";

contract ParcelContract is Ownable,Rejector {
    
    bytes32 public version = "1.0";
    address public sender;
    address public courier;
    address public receiver;
    address public platformWallet = address(0xdD870fA1b7C4700F2BD7f44238821C26f7392148);
    
    uint256 public transportCost = 0;
    uint256 public platformCost = 0;
    uint256 public weiLockedBySender = 0;
    
    // parcel data
    bytes32 public parcelHash; 
    
    // delivery data
    bytes32 publicdeliveryAddress;
    uint256 public deliveryStart = 0;
    uint256 public deliveryEnd = 0;
    
    // pickup data
    bytes32 public pickupAddress;
    uint256 public pickupStart = 0;
    uint256 public pickupEnd = 0;
    
    bool public senderSigned  = false;
    uint256 public senderSignedTimeStamp = 0;
    
    bool public courierSigned  = false;
    uint256 public courierSignedTimeStamp = 0;
    
    bool public receiverSigned = false;
    uint256 public receiverSignedTimeStamp = 0;
    
    uint256 public pickupTimeStamp = 0; 
    uint256 public deliveredTimeStamp = 0;
    uint public deliveredToSenderTimeStamp = 0;
    
    uint256 public readyForPickupTimeStampSender = 0;
    int public readyForPickupLongitudeSender = 0;
    int public readyForPickupLatitudeSender = 0;
    
    uint256 public readyForPickupTimeStampCourier = 0;
    int public readyForPickupLongitudeCourier = 0;
    int public readyForPickupLatitudeCourier = 0;
    
    uint256 public readyForDeliveryTimeStampReceiver = 0;
    int public readyForDeliveryLongitudeReceiver = 0;
    int public readyForDeliveryLatitudeReceiver = 0;
    
    uint256 public readyForDeliveryTimeStampCourier = 0;
    int public readyForDeliveryLongitudeCourier = 0;
    int public readyForDeliveryLatitudeCourier = 0;
    
    int public accuracyDeliveryAndPickup = 0;
    int public deliveryLatitude = 0;
    int public deliveryLongitude = 0;
    int public pickupLatitude = 0;
    int public pickupLongitude = 0;
    
    constructor
    (
        address _owner, 
        address _sender, 
        address _courier, 
        address _receiver,  
        bytes32 _parcelHash, 
        uint256 _transportCost, 
        uint256 _platformCost, 
        int _deliveryLongitude, 
        int _deliveryLatitude, 
        int _pickupLongitude, 
        int _pickupLatitude, 
        int _accuracyDeliveryAndPickup, 
        uint256 _deliveryStart, 
        uint256 _deliveryEnd, 
        uint256 _pickupStart, 
        uint256 _pickupEnd
    ) public {
        require(isValidLongitudeAndLatitude(_deliveryLongitude, _deliveryLatitude), "Invalid delivery longitude or latitude");
        require(isValidLongitudeAndLatitude(_pickupLongitude, _pickupLatitude), "Invalid pickup longitude or latitude");
        require(_accuracyDeliveryAndPickup >= 50 && _accuracyDeliveryAndPickup <= 150, "accuracy of delivery and pickup is not between 50 and 150");
        
        owner = _owner;
        sender = _sender;
        courier = _courier;
        receiver = _receiver;
        
        parcelHash = _parcelHash;
        
        transportCost = _transportCost;
        platformCost = _platformCost;
        
        accuracyDeliveryAndPickup = _accuracyDeliveryAndPickup;
        deliveryLatitude = _deliveryLatitude;
        deliveryLongitude = _deliveryLongitude;
        pickupLatitude = _pickupLatitude;
        pickupLongitude = _pickupLongitude;
        
        pickupStart = _pickupStart;
        pickupEnd = _pickupEnd;
        deliveryStart = _deliveryStart;
        deliveryEnd = _deliveryEnd;
    }
    
    function sign() public payable onlyParticipant {
        if(sender == msg.sender && !senderSigned)
        {
            require(msg.value == (transportCost + platformCost), "When signing as sender the msg.value must be equals the transport and platfrom cost");
            senderSigned = true;
            senderSignedTimeStamp = now;
            
            weiLockedBySender = msg.value;
        }
        if(courier == msg.sender && !courierSigned)
        {
            courierSigned = true;
            courierSignedTimeStamp = now;    
        }
        if(receiver == msg.sender && !receiverSigned)
        {
            receiverSigned = true;
            receiverSignedTimeStamp = now;    
        }
    }
    
    function unsign() public onlyParticipant {
        require(pickupTimeStamp == 0, "package is already picked up");
        require(now < pickupStart  || now > pickupEnd, "Cannot unsing in pickup time");
        
        
        if(sender == msg.sender && senderSigned)
        {
            sender.transfer(transportCost + platformCost);
            senderSigned = false;
            senderSignedTimeStamp = 0;
            
            weiLockedBySender = 0;
        }
        if(courier == msg.sender && courierSigned)
        {
            courierSigned = false;
            courierSignedTimeStamp = 0;    
        }
        if(receiver == msg.sender && receiverSigned)
        {
            receiverSigned = false;
            receiverSignedTimeStamp = 0;    
        }
    }
    
    function pickup() public onlyCourier onlySignedContract {
        require(pickupTimeStamp == 0, "Cannot pickup twice");
        pickupTimeStamp = now;
    }
    
    function delivered() public onlyReceiver onlySignedContract {
        require(deliveredTimeStamp == 0, "Cannot deliver twice.");
        require (pickupTimeStamp > 0, "Parcel was not picked up.");
        deliveredTimeStamp = now;
        
        if(now <= deliveryEnd) {
            // add reward to transport transportcost
        }
        else {
            // return reward to sender
        }
        courier.transfer(transportCost);
        platformWallet.transfer(platformCost);
    }
    
    function deliverdToSender() public onlySender onlySignedContract {
        require(deliveredTimeStamp == 0, "Cannot be delivered.");
        require (pickupTimeStamp > 0, "Parcel was not picked up.");
        deliveredToSenderTimeStamp = now;
        
        sender.transfer(transportCost);
        platformWallet.transfer(platformCost);
    }
    
    function readyForPickup(int longitude, int latidude) public onlyCourierOrSender onlySignedContract {
        require(isValidLongitudeAndLatitude(longitude, latidude), "Invalid longitude or latitude for readyForPickup function");
        require(nearbyPickupOrdDelivery(pickupLongitude, longitude), "Longitude is to far from pickup point");
        require(nearbyPickupOrdDelivery(pickupLatitude, latidude), "Latitude is to far from pickup point");
        
        if(sender == msg.sender)
        {
            readyForPickupTimeStampSender = now;
            readyForPickupLongitudeSender = longitude;
            readyForPickupLatitudeSender = latidude;
        }
        else if(courier == msg.sender)
        {
            readyForPickupTimeStampCourier = now;
            readyForPickupLongitudeCourier = longitude;
            readyForPickupLatitudeCourier  = latidude;
        }
    }
    
    function readyForDelivery(int longitude, int latidude) public onlyCourierOrReceiver onlySignedContract {
        require(isValidLongitudeAndLatitude(longitude, latidude), "Invalid longitude or latitude for readyForDelivery function");
        require(nearbyPickupOrdDelivery(deliveryLongitude, longitude), "Longitude is to far from delivery point");
        require(nearbyPickupOrdDelivery(deliveryLatitude, latidude), "Latitude is to far from delivery point");
        
        if(receiver == msg.sender)
        {
            readyForDeliveryTimeStampReceiver = now;
            readyForDeliveryLongitudeReceiver = longitude;
            readyForDeliveryLatitudeReceiver = latidude;
        }
        else if(courier == msg.sender)
        {
            readyForDeliveryTimeStampCourier = now;
            readyForDeliveryLongitudeCourier = longitude;
            readyForDeliveryLatitudeCourier  = latidude;
        }
    }
    
    function nearbyPickupOrdDelivery(int pointA, int pointB) private view returns (bool) {
        int result = pointA - pointB;
        if(result < 0)
            result = result * -1;
            
        return result <= accuracyDeliveryAndPickup;
    }
    
    function isValidLongitudeAndLatitude(int256 longitude, int256 latitude) private pure returns (bool) {
        return ((longitude > -18000000000 && longitude < 18000000000) && (latitude > -8505112878 && latitude < 8505112878));
    }
    
    modifier onlySender() {
        require (msg.sender == sender, "only sender allowed!");
        _;
    }
    
    modifier onlyCourier() {
        require (msg.sender == courier, "only courier allowed!");
        _;
    }
    
    modifier onlyReceiver() {
        require (msg.sender == receiver, "only reciever allowed!");
        _;
    }
    
    modifier onlyCourierOrSender() {
        require (msg.sender == courier || msg.sender == sender, "only sender or courier allowed!");
        _;
    }
    
    modifier onlyCourierOrReceiver() {
        require (msg.sender == receiver || msg.sender == sender, "only receiver or courier allowed!");
        _;
    }
    
    modifier onlyParticipant() {
        require (msg.sender == courier || msg.sender == receiver || msg.sender == sender, "Only participant allowed");
        _;
    }
    modifier onlySignedContract() {
        require(senderSigned, "Sender has not signed contract!");
        require(courierSigned, "Courier has not signed contract!");
        require(receiverSigned, "Receiver has not signed contract");
        _;
    }
}