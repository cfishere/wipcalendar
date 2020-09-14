<?php 

//require_once('classes/session.php');  security.php includes session.php
require_once('classes/security.php');
//session_start();
//$_SESSION['counter']++;
//echo "You have visited this page $_SESSION[counter] times.";
$auth = new userAuthenticate;
$u;
$warn = '<span id="msg" style="color:#FF0000;font-size:17px;font-weight:bold">-----<br>';
$warnEnd = '<br>-----</span>';
$error='';




if( isset( $_POST['username'] ) ) {
	
	//$auth = new userAuthenticate();
	
	/*returns array logged [
		'status' => (str) (AUTH, PSWDfail, USRNfail), 
		'user' => (str) username found, or on USRNfail, the POSTed username
		'role' => (str) (guest, admin, user, etc)
		'userId' => $result['id'], 
		'company' => $result['company']) (ALL, 0, 1, etc.)
	]
	*/
	//var_dump($auth->logged);
	
	if ( $auth->logged['status'] == 'AUTH' ) {
		
		// this user has been authenticated	
		
		// admin?
		if( $auth->logged['role'] === 'admin' || $auth->logged['role'] === 'mgr' ) {		
		
			$sesID ='';
			$_SESSION["user"]["status"] = $auth->logged['status'];
			$_SESSION["user"]["name"] = $auth->logged['user'];
			$_SESSION["user"]["role"] = $auth->logged['role'];  
			$_SESSION["user"]["userId"] = $auth->logged['userId'];
			$_SESSION["user"]["company"] = $auth->logged['company'];
			if( session_id() ) {	
				$sesID = session_id();
				$sesID = '&sid='.$sesID;					
			}
			
			//var_dump($_SESSION["user"]);
			
			
			//TODO: ya don't need to pass url parameters since these are 
			//stored in the session, accessible to the redirected page.
			header( 'Location: index.php?user='.$auth->uUsername.$sesID );
			
		} elseif(!empty($auth->logged['role']) && $auth->logged['role'] !== 'guest') {
			// authenticated as a non-admin / non-mgr or NULL role.
			//TODO: Just redirect view only users.  No need for the message and links.
			if( session_id() ) {	
				$sesID = session_id();
				$sesID = '&sid='.$sesID;					
			}	
			$_SESSION["user"]["status"] = $auth->logged['status'];
			$_SESSION["user"]["name"] = $auth->logged['user'];
			$_SESSION["user"]["role"] = $auth->logged['role'];  
			$_SESSION["user"]["userId"] = $auth->logged['userId'];
			$_SESSION["user"]["company"] = $auth->logged['company'];		
			$_SESSION['user']['loggedintime'] =  $auth->logged['loggedintime'];
			
			//$u = ( empty($auth->adminNameWithToken) ) ?  'Someone else': strtoupper($auth->adminNameWithToken);

			$error .= "<span style=\"font-size: 17px\">Welcome " . $auth->logged['user'] . "</span><br><br>";
			//$error .= $u." is currently logged in as the Calendar Administrator.<br>";
			$error .= "Go to the <a href=\"view.php?user=".$auth->logged['user'].$sesID."\">Calendar</a>";
			$error .= "<br><br>Or View/Edit the <a href=\"directory.php\">Company Phone Directory</a>";
				$error .="<br><br>or Logout<br><br><form action=\"login.php\" method=\"POST\" >
			<input type=\"hidden\" value=\"".$auth->logged['user']."\" name=\"loggedOutUser\" />
			<input type=\"submit\" value=\"logout\" name=\"logout\" />
			</form>";	
			
		}
		
	}
	elseif($auth->logged['status'] == 'USRNfail') {
		
		//header('Location: login.php');
		$error .= "Record not Found for " . $auth->logged['user']. ".";
	} elseif($auth->logged['status'] == 'PSWDfail'){
		$error .= "Password Failed with User: " . $auth->logged['user']. ".";
	}

} //end "if post is login" action; handle logout requests, below:
elseif( isset($_POST['loggedOutUser']) ) {
	
	//release the admin token if logged out user is admin or mgr
	if( $_SESSION['user']['role'] === 'admin' || $_SESSION['user']['role'] === 'mgr') {
		//echo 'release token called';
		
			
		if( $auth->unleaseToken( $_SESSION['user']['userId'] ) === FALSE ){

			$error .= '[ Unleasing the Admin Token failed. ]<br><br>';

		}
		
	} 
		//just set loggedin status to 0 (false) in tbl users:
		$auth->updateLoggedInStatus( $_SESSION['user']['userId'], false );
		//$_SESSION['user']['loggedintime'] =  $auth->logged['loggedintime'];
	
	// delete session from database; see session class.
	
	session_destroy();
	$error .= $_POST['loggedOutUser'] ." successfully logged out.";
	
	
//active session id...	
} 
	
	
	
	if( session_id() !== NULL && !isset($_POST['loggedOutUser']) ) {
	
	//this is an admin or mgr
	if( @$_SESSION['user']['role'] === 'admin' || @$_SESSION['user']['role'] === 'mgr' ) {
		
		
		
			//var_dump($_SESSION["user"]);
			//{ ["name"]=> string(10) "outmanager" ["role"]=> string(3) "mgr" ["userId"]=> int(60) ["company"]=> int(3) } 
			
			
		

		
		
		$error .= "You are already Logged in as <br>" . $_SESSION['user']['name'] . " with ".strtoupper($_SESSION['user']['role'])." Editing Rights.<br><br>";
		$error .="Visit the Editable Version of the <a href=\"index.php\" > WIP Calendar</a><br><br>";
		
		//logout option:
		$error .="<br><form action=\"login.php\" method=\"POST\" >
		<input type=\"hidden\" value=\"".$auth->logged['user']."\" name=\"loggedOutUser\" />
		<input type=\"submit\" value=\"logout\" name=\"logout\" />
		</form><br>";
		
		//only admins can register users
		if( @$_SESSION['user']['role'] === 'admin'){
			$error .="....or<br><br>
			<form action=\"register.php\" method=\"POST\" >
			<input type=\"hidden\" value=\"".$_SESSION['user']['role']."\" name=\"role\" />
			<input type=\"submit\" value=\"Register a User\" name=\"logout\" />
			</form>";
		}
		
	} elseif( isset( $_SESSION['user']['role'] ) && @$_SESSION['user']['role'] === 'admin' ) {
		
		$u = ( empty($auth->adminNameWithToken) ? 'Someone else ' : strtoupper($auth->adminNameWithToken));
		
		$error .= "<span style=\"font-size: 17px\">Welcome " . $auth->logged['user'] . "</span><br><br>";
		(!empty($u)) ? $u = '['.$u.']' : $u = '[?]';
		$error .= "Someone Else ".$u." is Currently Logged in as the Calendar Admin.<br>";
		$error .= "You've <strong>VIEW-ONLY-ACCESS</strong> to the <a href=\"view.php\">Calendar</a>";
		$error .= "<br><br>And Can View/Edit the <a href=\"directory.php\">Company Phone Directory</a>";
		//logout option:
		$error .="<br><br>or<br><br><form action=\"login.php\" method=\"POST\" >
		<input type=\"hidden\" value=\"".$auth->logged['user']."\" name=\"loggedOutUser\" />
		<input type=\"submit\" value=\"logout\" name=\"logout\" />
		</form>";
		
	}
	//echo session_id();
	
}



?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title>LOGIN TO WIP CALENDAR</title>
	<script type="text/javascript">
		//browser detect Edge and IE, Warn User
	function detectIE() {
	  var ua = window.navigator.userAgent;

	  // Test values; Uncomment to check result …

	  // IE 10
	  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

	  // IE 11
	  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

	  // Edge 12 (Spartan)
	  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

	  // Edge 13
	  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

	  var msie = ua.indexOf('MSIE ');
	  if (msie > 0) {
		// IE 10 or older => return version number
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	  }

	  var trident = ua.indexOf('Trident/');
	  if (trident > 0) {
		// IE 11 => return version number
		var rv = ua.indexOf('rv:');
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	  }

	  var edge = ua.indexOf('Edge/');
	  if (edge > 0) {
		// Edge (IE 12+) => return version number
		return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	  }

	  // other browser
	  return false;
	}
    var browserIsBad = detectIE();
	if(browserIsBad !== false){
		alert("Use FireFox or Chrome Browsers for the Calendar.  IExplorer/Edge is Buggy.");
	}
	</script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="assets/micropage.css" />
</head>
<body>
<div id="page">
    <!-- [banner] -->
    <header id="banner">
        <hgroup>
            <h1 class="T_RexTitle">Login</h1>
        </hgroup>        
    </header>
    <!-- [content] -->
    <section id="content">
       <?php if($error !== '') echo $warn.$error.$warnEnd; ?>
       <div id="miniform">
 <form id="login" method="post">
			  <label for="username">Username:</label>
			  <input id="username" name="username" type="text" required><br><br>
			  <label for="password">Password:</label>
			  <input id="password" name="password" type="password" required>                    
			   <br /><br />
			   <input id="viewonly" name="viewonly" type="checkbox" checked><span> View Only [<a href="#" title="Unless you are an Admin User and needing to editing the Calendar this session, log in as a regular user.">Info</a>]</span>
			   <br><br>			  
			   <div  class="center"> <input type="submit" name="submit" value="Login"> </div>
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
