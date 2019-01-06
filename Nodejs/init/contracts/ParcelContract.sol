pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./Rejector.sol";

contract ParcelContract is Ownable, Rejector {
    
    bytes32 public version = "1.0";
    address public sender;
    address public courier;
    address public receiver;
    address public platformWallet = address(0x2f19621DCa80D7CCb5fC9eEF427eA2De92596CA8);
    
    uint256 public transportCost = 0;
    uint256 public platformCost = 0;
    uint256 public weiLockedBySender = 0;
    
    // parcel data
    bytes32 public parcelHash; 
    
    // delivery data
    uint256 public deliveryStart = 0;
    uint256 public deliveryEnd = 0;
    int public deliveryLatitude = 0;
    int public deliveryLongitude = 0;
    
    // pickup data
    uint256 public pickupStart = 0;
    uint256 public pickupEnd = 0;
    int public pickupLatitude = 0;
    int public pickupLongitude = 0;

    int public accuracyDeliveryAndPickup = 0;
    
    bool public senderSigned  = false;
    uint256 public senderSignedTimeStamp = 0;
    
    bool public courierSigned  = false;
    uint256 public courierSignedTimeStamp = 0;
    
    bool public receiverSigned = false;
    uint256 public receiverSignedTimeStamp = 0;
    
    uint256 public pickupTimeStamp = 0; 
    uint256 public deliveredTimeStamp = 0;
    uint256 public deliveredToSenderTimeStamp = 0;
    
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
    
    function deliveredToSender() public onlySender onlySignedContract {
        require(deliveredTimeStamp == 0, "Cannot be delivered.");
        require (pickupTimeStamp > 0, "Parcel was not picked up.");
        deliveredToSenderTimeStamp = now;
        
        sender.transfer(transportCost);
        platformWallet.transfer(platformCost);
    }
    
    function readyForPickup(int longitude, int latitude) public onlyCourierOrSender onlySignedContract {
        require(isValidLongitudeAndLatitude(longitude, latitude), "Invalid longitude or latitude for readyForPickup function");
        require(nearbyPickupOrdDelivery(pickupLongitude, longitude), "Longitude is to far from pickup point");
        require(nearbyPickupOrdDelivery(pickupLatitude, latitude), "Latitude is to far from pickup point");
        
        if(sender == msg.sender)
        {
            readyForPickupTimeStampSender = now;
            readyForPickupLongitudeSender = longitude;
            readyForPickupLatitudeSender = latitude;
        }
        else if(courier == msg.sender)
        {
            readyForPickupTimeStampCourier = now;
            readyForPickupLongitudeCourier = longitude;
            readyForPickupLatitudeCourier  = latitude;
        }
    }
    
    function readyForDelivery(int longitude, int latitude) public onlyCourierOrReceiver onlySignedContract {
        require(isValidLongitudeAndLatitude(longitude, latitude), "Invalid longitude or latitude for readyForDelivery function");
        require(nearbyPickupOrdDelivery(deliveryLongitude, longitude), "Longitude is to far from delivery point");
        require(nearbyPickupOrdDelivery(deliveryLatitude, latitude), "Latitude is to far from delivery point");
        
        if(receiver == msg.sender)
        {
            readyForDeliveryTimeStampReceiver = now;
            readyForDeliveryLongitudeReceiver = longitude;
            readyForDeliveryLatitudeReceiver = latitude;
        }
        else if(courier == msg.sender)
        {
            readyForDeliveryTimeStampCourier = now;
            readyForDeliveryLongitudeCourier = longitude;
            readyForDeliveryLatitudeCourier  = latitude;
        }
    }
    
    function readReadyEvents() public view onlyParticipantAndOwner returns
    (
        uint256 _readyForPickupTimeStampSender,
        int _readyForPickupLongitudeSender,
        int _readyForPickupLatitudeSender,
        uint256 _readyForPickupTimeStampCourier,
        int _readyForPickupLongitudeCourier,
        int _readyForPickupLatitudeCourier,
        uint256 _readyForDeliveryTimeStampReceiver,
        int _readyForDeliveryLongitudeReceiver,
        int _readyForDeliveryLatitudeReceiver,
        uint256 _readyForDeliveryTimeStampCourier,
        int _readyForDeliveryLongitudeCourier,
        int _readyForDeliveryLatitudeCourier
    ) {
        _readyForPickupTimeStampSender = readyForPickupTimeStampSender;
        _readyForPickupLongitudeSender = readyForPickupLongitudeSender;
        _readyForPickupLatitudeSender = readyForPickupLatitudeSender;
        _readyForPickupTimeStampCourier = readyForPickupTimeStampCourier;
        _readyForPickupLongitudeCourier = readyForPickupLongitudeCourier;
        _readyForPickupLatitudeCourier = readyForPickupLatitudeCourier;
        _readyForDeliveryTimeStampReceiver = readyForDeliveryTimeStampReceiver;
        _readyForDeliveryLongitudeReceiver = readyForDeliveryLongitudeReceiver;
        _readyForDeliveryLatitudeReceiver = readyForDeliveryLatitudeReceiver;
        _readyForDeliveryTimeStampCourier = readyForDeliveryTimeStampCourier;
        _readyForDeliveryLongitudeCourier = readyForDeliveryLongitudeCourier;
        _readyForDeliveryLatitudeCourier = readyForDeliveryLatitudeCourier;
    }
    
    function readMainEvents() public view onlyParticipantAndOwner returns
    (
        bool _senderSigned,
        uint256 _senderSignedTimeStamp,
        bool _courierSigned,
        uint256 _courierSignedTimeStamp,
        bool _receiverSigned,
        uint256 _receiverSignedTimeStamp,
        uint256 _pickupTimeStamp,
        uint256 _deliveredTimeStamp,
        uint256 _deliveredToSenderTimeStamp
    ) {
        _senderSigned = senderSigned;
        _senderSignedTimeStamp = senderSignedTimeStamp;
        _courierSigned = courierSigned;
        _courierSignedTimeStamp = courierSignedTimeStamp;
        _receiverSigned = receiverSigned;
        _receiverSignedTimeStamp = receiverSignedTimeStamp;
        _pickupTimeStamp = pickupTimeStamp;
        _deliveredTimeStamp = deliveredTimeStamp;
        _deliveredToSenderTimeStamp = deliveredToSenderTimeStamp;
    }
    
    function readDetails() public view onlyParticipantAndOwner returns
    (
        bytes32 _version,
        int _accuracyDeliveryAndPickup,
        uint256 _platformCost,
        address _sender,
        address _courier,
        address _receiver,
        uint256 _transportCost,
        uint256 _weiLockedBySender,
        bytes32 _parcelHash
    ) {
        _version = version;
        _platformCost = platformCost;
        _accuracyDeliveryAndPickup = accuracyDeliveryAndPickup;
        _sender = sender;
        _courier = courier;
        _receiver = receiver;
        _transportCost = transportCost;
        _weiLockedBySender = weiLockedBySender;
        _parcelHash = parcelHash;
    }
    
    function readPickupAndDeliveryDetails() public view onlyParticipantAndOwner returns
    (
        uint256 _deliveryStart,
        uint256 _deliveryEnd,
        uint256 _pickupStart,
        uint256 _pickupEnd,
        int _deliveryLatitude,
        int _deliveryLongitude,
        int _pickupLatitude,
        int _pickupLongitude
    ) {
        _deliveryStart = deliveryStart;
        _deliveryEnd = deliveryEnd;
        _pickupStart = pickupStart;
        _pickupEnd = pickupEnd;
        _deliveryLatitude = deliveryLatitude;
        _deliveryLongitude = deliveryLongitude;
        _pickupLatitude = pickupLatitude;
        _pickupLongitude = pickupLongitude;
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
    modifier onlyParticipantAndOwner() {
        require (msg.sender == courier || msg.sender == receiver || msg.sender == sender || msg.sender == owner, "Only participant or owner allowed");
        _;
    }
    modifier onlySignedContract() {
        require(senderSigned, "Sender has not signed contract!");
        require(courierSigned, "Courier has not signed contract!");
        require(receiverSigned, "Receiver has not signed contract");
        _;
    }
}