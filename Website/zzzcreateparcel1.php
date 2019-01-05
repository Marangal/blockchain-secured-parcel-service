<?php
require('db.php');
include("auth.php");
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
    <title>DiNiJo - Create a parcel</title>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="description" content="">
      <meta name="viewport" content="width=device-width, initial-scale=1">

      <link rel="stylesheet" href="css/main.css">
      <link href='http://fonts.googleapis.com/css?family=Roboto:400,300,500' rel='stylesheet' type='text/css'>
      <link href="//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">
      <script src="js/jquery-1.8.2.min.js"></script>
      <script src="js/jquery.validate.min.js"></script>
      <script src="js/main.js"></script>
</head>
<body>
  <?php
  require('db.php');
  // If form submitted, insert values into the database.
  if (isset($_POST['submit_parcel'])){
  	$parcel_name = stripslashes($_REQUEST['parcel_name']);
  	$parcel_name = mysqli_real_escape_string($con,$parcel_name);

    $parcel_desc = stripslashes($_REQUEST['parcel_desc']);
    $parcel_desc = mysqli_real_escape_string($con,$parcel_desc);
    $parcel_receiver = stripslashes($_REQUEST['parcel_receiver']);
    $parcel_receiver = mysqli_real_escape_string($con,$parcel_receiver);
    $parcel_receiver_address = stripslashes($_REQUEST['parcel_receiver_address']);
    $parcel_receiver_address = mysqli_real_escape_string($con,$parcel_receiver_address);
    $parcel_receiver_city = stripslashes($_REQUEST['parcel_receiver_city']);
    $parcel_receiver_city = mysqli_real_escape_string($con,$parcel_receiver_city);
    $parcel_weight = stripslashes($_REQUEST['parcel_weight']);
    $parcel_weight = mysqli_real_escape_string($con,$parcel_weight);
    $parcel_size = stripslashes($_REQUEST['parcel_size']);
    $parcel_size = mysqli_real_escape_string($con,$parcel_size);
    $parcel_coldhot = isset($_POST['parcel_coldhot']);
    $parcel_fragile = isset($_POST['parcel_fragile']);
    $parcel_pickup_date_start = isset($_POST['parcel_pickup_date_start']);

    $parcel_pickup_date_end = isset($_POST['parcel_pickup_date_end']);

    $parcel_delivery_date_start = isset($_POST['parcel_delivery_date_start']);

    $parcel_delivery_date_end = isset($_POST['parcel_delivery_date_end']);

    $parcel_prio = stripslashes($_REQUEST['parcel_prio']);
    $parcel_prio = mysqli_real_escape_string($con,$parcel_prio);
    $parcel_reward = stripslashes($_REQUEST['parcel_reward']);
    $parcel_reward = mysqli_real_escape_string($con,$parcel_reward);
  	$trn_date = date("Y-m-d H:i:s");




          $query = "INSERT into 'parcels' (parcel_name, parcel_desc, parcel_receiver, parcel_receiver_address, parcel_receiver_city, parcel_weight, parcel_size, parcel_coldhot, parcel_fragile, parcel_pickup_date_start, parcel_pickup_date_end, parcel_delivery_date_start, parcel_delivery_date_end, parcel_prio, parcel_reward, trn_date)
VALUES ('$parcel_name', '$parcel_desc', '$parcel_receiver', '$parcel_receiver_address', '$parcel_receiver_city', '$parcel_weight', '$parcel_size', $parcel_coldhot, $parcel_fragile, '$parcel_pickup_date_start', '$parcel_pickup_date_end', '$parcel_delivery_date_start', '$parcel_delivery_date_end', '$parcel_prio', '$parcel_reward', '$trn_date')";



          $result = mysqli_query($con,$query);
          if($result){
              echo "<div class='form'>
  <h3>You have successfully added a parcel</h3>
  <br/><a href='index.php'>Click here to go back to the home page</a></div>";


}}
  ?>

  <!-- +++++++ Groene balk +++++++ -->

  <div id="footerdeadzone">
           DiNiJo - Dashboard of <?php echo $_SESSION['username']; ?>
  </div>
    <span class=registerQ><a href="logout.php">Logout</a></span>


  <!-- +++++++ Logo +++++++ -->

        <img src="img/Logo.png" class="logoindex"><span class="logotekst">Dinijo</span><br />

  <!-- +++++++ Upper +++++++ -->
  <p>Welcome <?php echo $_SESSION['username']; ?>!</p>
  Fill in the form below to create your parcel </p>

  <div class="form">
  <!-- <div id="loginheader">Log In</div> -->
  <form id="createparcel-form" class="createparcel-form" action="" method="post" name="createparcel">
  <img src="img/rounded/B_box.png">     <input type="text" name="parcel_name" placeholder="Name your parcel (e.g. Toy dinosaur)" id="blocktop" required /> </br>
   <input type="text" name="parcel_desc" placeholder="Describe your parcel (optional)" id="blockbottom" />  </br>
  <img src="img/rounded/B_destination.png"> <input type="text" name="parcel_receiver" placeholder="Receivers' e-mail" id="blocktop" required /> </br>
   <input type="text" name="parcel_receiver_address" placeholder="Receivers' address" id="blockbottom" required /> <input type="text" name="parcel_receiver_city" placeholder="Receivers' city" id="blockbottom" required /> </br>
  <img src="img/rounded/B_weigth.png"> <select name="parcel_weight" style="width:200px;"></p>
    <option value="">Select...</option>
    <option value="A">Feather</option>
    <option value="B">Light</option>
    <option value="C">Medium</option>
    <option value="D">Heavy</option>
    <option value="E">Elephant</option>
  </select> the weight of your parcel </p>
  <img src="img/rounded/B_size.png"> <select name="parcel_size" style="width:200px;"></p>
    <option value="">Select...</option>
    <option value="A">Tiny</option>
    <option value="B">Small</option>
    <option value="C">Medium</option>
    <option value="D">Big</option>
    <option value="E">Humongous</option>
  </select> the size of your parcel </p>
  <img src="img/rounded/B_hotcold.png"> Is your parcel Cold/hot sensitive? <input type="checkbox" name="parcel_coldhot" value="0" class="checkboxx"/> </p>
  <img src="img/rounded/B_fragile.png"> Is the parcel fragile? <input type="checkbox" name="parcel_fragile" value="0" class="checkboxx" /> </p>
  <img src="img/rounded/B_callendar.png"> Pickup between <input type="datetime-local" name="parcel_pickup_date_start"  required /> and  <input type="datetime-local" name="parcel_pickup_date_end"  required /></p>
  <img src="img/rounded/B_courier.png"> Deliver between <input type="datetime-local" name="parcel_delivery_date_start"  required /> and  <input type="datetime-local" name="parcel_delivery_date_end"  required /></p>
  <img src="img/rounded/B_chrono.png"> This parcel needs to be picked up with priority <select name="parcel_prio"></p>
    <option value="">Select...</option>
    <option value="1">(S)low</option>
    <option value="2">Normal</option>
    <option value="3">Quick!</option>
  </select> </p>
  <img src="img/rounded/B_money.png">     <input type="text" name="parcel_reward" placeholder="5 DNJ" required /> </p>
  <input name="submit_parcel" type="submit" value="Submit the parcel" />
  </form>
  </br>
  </div>

 <?php /* } */ ?>



    <p><a href="dashboard.php">Back to Dashboard</a></p>

<div class="form">
<p><a href="index.php">Home</a></p>
<a href="logout.php">Logout</a>

<div class="center"><input type="checkbox" id="cbx" style="display:none"/><label for="cbx" class="toggle"><span></span></label></div>









</div>
</body>
</html>
