<?php 
//libxml_use_internal_errors(true);
require_once('classes/register.php');
$register = new register();
//print_r($_SESSION);


$warn = '<span id="msg" style="color:#FF0000;font-size:17px;font-weight:bold">-----<br>';
$warnEnd = '<br>-----</span>';
$msg='';
if($_SESSION['user']['role'] !== 'admin'){
	$_SESSION["user"] = array('name' => $_SESSION['user']['name'], 'role' => $_SESSION['user']['role']);
	header('Location: http://customsigncenter.com/calendar/login.php');	
	
} 
if( isset($_POST["submitregistration"]) ) {	
	if($register->connected == TRUE){
		$register->save();
	}

	
	

		

		if ( $register->status === true ) {	//returns true if user account was created
			  $msg = 'Successfully Created a User Account with Username ' . $register->uUsername . ' and Password ' . $register->uPassword . '.<br>Login <a href="login.php">Here</a>';
			 // header('Location: index.php');		
			//echo 'The header would redirect me to index.';
		}
		else { // output the message from the register class on failure

			$msg = $register->userMessage;
		}

	}
 ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title>REGISTER A USER ACCOUNT FOR WIP CALENDAR</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="assets/micropage.css" />
</head>
<body>
<div id="page">
    <!-- [banner] -->
    <header id="banner">
        <hgroup>
		   <h1 class="T_RexTitle">Register</h1>
        </hgroup>        
    </header>
    <!-- [content] -->
    <section id="content">
       <?php if( $msg !== '' ) { 
			echo $warn.$msg.$warnEnd.'<br><br>Login <a href="login.php">Here</a>';			
		} ?>
		<p>All new users default to a simple user with view-only access.<br/>If you want to
			elevate a user's permissions to<br/>ADMIN or MANAGER, send a request to chris@customsigncenter.com.</p>
        <div id="miniform">
        <form id="login" method="post">
            <label for="username">Username (must be unique in database):</label>
            <input id="username" name="username" type="text" required="required"><br><br>
            <label for="password">Password (use letters and/or numbers):</label>
            <input id="password" name="password" type="password" required="required"> <br><br>
             <label for="email">Email:</label><br>
            <input id="email" name="email" type="text" required="required">
			<br><br>
			<label for="company">New User Can View Which Calendar(s)?:</label><br><br>
			<select id="company" name="company" >
				<option  value="none">Select</option>
				<option  value="0">Custom Sign Center</option>
				<option  value="3">Outdoor</option>
				<option  value="1">Marion Signs</option>
				<option  value="2">Boyer Signs</option>
				<option  value="4">JG Signs</option>
				<option value="ALL">All</option>
			</select>
			<p>The above ONLY applies limits on ADMINs and MANAGERs.<br> Since basic users cannot take actions, they can access any calendar.</p>
            <input type="hidden" name="role" value="user" >                
            <br><br>
            <input type="submit" name="submitregistration" value="Register">
        </form>
	    </div>
    </section>
    <!-- [/content] -->
    
     <footer id="footer">
        <details>
            <p>Copyright - <?php echo date('Y',strtotime('today')); ?></p>
          
            <p>Custom Sign Center, INC. All Rights Reserved.</p>
        </details>
    </footer>
</div>
<!-- [/page] -->
</body>
</html>