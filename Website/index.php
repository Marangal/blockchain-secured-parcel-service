<?php
//include auth.php file on all secure pages
include("auth.php");
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
  <title>DiNiJo - Dashboard</title>
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
<!-- +++++++ Groene balk +++++++ -->

<div id="footerdeadzone">
         DiNiJo - Dashboard of <?php echo $_SESSION['username']; ?>
</div>
  <span class=registerQ><a href="logout.php">Logout</a></span>


<!-- +++++++ Logo +++++++ -->

      <img src="img/Logo.png" class="logoindex"><span class="logotekst">Dinijo</span><br />

<!-- +++++++ Upper +++++++ -->


 <div class="contentIndex">
<!--    <div id="header1">  -->
      <p id="normaltextIndex">  Welcome <?php echo $_SESSION['username']; ?>!</p>
      <p id="headerIndex">      This is the secure area. </p>

      <p id="normaltextIndex">  NOTICE: DEV-Area: security not implemented! The purpose of this environment purely shows the Proof of Concept, without extended programming.
          You are now a simple user. Create an extended profile in order to become a courier or to send a parcel. 
      <p id="headerIndex">     <a href="dashboard.php"><img src="img/rounded/B_destination.png"></a>  <a href="dashboard.php">Dashboard</a> </p>

      <p id="normaltextIndex">  Here we find an overview of your transaction </br>
       [Import module which hows all past, present and future jobs and events]</p>

</div>

<!-- +++++++ PLAY Area --------->

      <p id="headerIndex"><a href="createparcel.php"><img src="img/rounded/B_box.png"></a> <a href="createparcel.php">Create a parcel</div></a></p>
      <p id="normaltextIndex">  Here we find an overview of your parcels </br>
</br>

<!-- <img src="img/rounded/B_box.png">
<img src="img/rounded/B_callendar.png">
<img src="img/rounded/B_chrono.png"> </p>
<img src="img/rounded/B_fragile.png">
<img src="img/rounded/B_hotcold.png">
<img src="img/rounded/B_money.png"> </p>
<img src="img/rounded/B_request.png">
<img src="img/rounded/B_size.png">
<img src="img/rounded/B_weigth.png"> </p>
<img src="img/rounded/B_courier.png">        -->






</body>
</html>
