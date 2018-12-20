<!DOCTYPE html>
<html>
<head>
		<meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>DiniJo - Welcome</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="stylesheet" href="css/main.css">
        <link href='http://fonts.googleapis.com/css?family=Roboto:400,300,500' rel='stylesheet' type='text/css'>
        <link href="//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">
        <script src="js/jquery-1.8.2.min.js"></script>
        <script src="js/jquery.validate.min.js"></script>
        <script src="js/main.js"></script></head>
<body>
	<?php
	require('db.php');
	session_start();
	// If form submitted, insert values into the database.
	if (isset($_POST['username'])){
        // removes backslashes
	$username = stripslashes($_REQUEST['username']);
        //escapes special characters in a string
	$username = mysqli_real_escape_string($con,$username);
	$password = stripslashes($_REQUEST['password']);
	$password = mysqli_real_escape_string($con,$password);
	//Checking is user existing in the database or not
    $query = "SELECT * FROM `users` WHERE username='$username'
		and password='".md5($password)."'";
	$result = mysqli_query($con,$query) or die(mysql_error());
	$rows = mysqli_num_rows($result);
        if($rows==1){
	    $_SESSION['username'] = $username;
            // Redirect user to index.php
	    header("Location: index.php");
         }else{
	echo "<div class='form'>
<h3>Username/password is incorrect.</h3>
Click here to <a href='login.php'>Login</a></div>";
	}
    }else{
?>

<!-- +++++++ Groene balk +++++++ -->

<div id="footerdeadzone">
         DiNiJo - The Parcel Service powered by you
    </div>

<!-- +++++ LOGIN FORM +++++ -->

<div class="form">
<!-- <div id="loginheader">Log In</div> -->
<form id="login-form" class="login-form" action="" method="post" name="login">
<input type="text" name="username" placeholder="Username" required />
<input type="password" name="password" placeholder="Password" required />
<input name="submit" type="submit" value="Login" />
</form>
</br>
<span class=registerQ>Not registered yet? <a href='register.php'>Register Here</a></span>
</div>
<?php } ?>

<!-- +++++++ Site header met logo +++++++ -->

      <img src="img/Logo.png" class="logo"><span class="logotekst">Dinijo Parcel Service</span><br />
        <span class="logotekst2">Secure parcel transfer service on the blockchain</span><br />

	 <div id="content">
		<div id="header1">What is DiNiJo? </div>
		 <div id="normaltext"> DiNiJo is a platform that connects people with purpose to send and receive packages. By using blockchain technology, parcels can be transported in a safe way with the advantage that you can trust the technology, not the person to whom you entrusted your valuable parcel. The application facilitates the transfer, and you are assured that the courier delivers your parcel to destination.  You will also be notified when the courier is at destination and your correspondent has received the parcel in good condition.   Using the DNJ, you can send packages of any size or weight –that is in the case you find someone who’s willing to do the job. DNJ is a civilian based parcel service. See it as you known package delivery services, with the exception it could be your neighbor that picks up and delivers your package.  Every delivery comes with a price. You can specify the fee for the courier as you wish, but jobs with a higher fee are probable to be picked first!  The platform facilitates the sending and receiving packages of all sizes and weights to its destination.
		</div>


		<div id="header1">How it works </div>
		 <div id="normaltext"> When signing up to DNJ, you can choose whether you want to send a parcel, or become a courier.  Depending on the role you play, you will   Sender The platform allows you, as a sender, to create requests for sending. Add information, such as weight, size, whether it is fragile, or heat/cold sensitive. This is important information for the courier. Large packages are not always as easy to transport as small ones. This way the courier knows whether he needs to take certain measures to get your package safely on location. Of course, you should also specify a region, so that it is clear to the courier what distance should be covered. Only when the courier accepts your order, the address of the destination becomes available. You can choose whether you want to reveal the contents of your package.  The last, yet not unimportant detail to specify are the time slots in which the courier can pick up and drop off the package.   Courier As a courier, you can pick job requests from the list. The list will give you basic information, such as the regions where the package should be picked up, the time windows in which the parcel should be picked up and dropped off, but also it’s weight, measurements, and other characteristics of the package.
		</div>

        <div id="iconen">
          <img src="img/senderrequest.png">
          <img src="img/courier.png">
          <img src="img/destination.png">
          <img src="img/parcel.png">
          <img src="img/weigth.png">
          <img src="img/chrono.png">
          <img src="img/size.png">
          <img src="img/money.png">

        </div>
	 </div>
</body>
</html>
