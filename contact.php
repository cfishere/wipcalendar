<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Bug Reporter - WIP Calendar App</title>
<style>
body{background-color:#071C3D; text-align:center}
#wrap-form{
	width: 440px; 
	padding:20px;
	border:#D9080C 1px solid; 
	background: #669E1E url(assets/ladybug.jpg) no-repeat 0 0;
	min-height: 500px;
	background-size:cover;
	margin: 40px auto;
	text-align:left;
	font-size: 17px;
}
</style>
</head>

<body>
<h1 style="text-align:center; color:#FFF; font-size: 45px;">WIP Calendar - Bug Report</h1>
<div id="wrap-form">
<p style="color:#FFFFFF"><span style="color:#9A24FF;font-size:22px">*</span> = Required</p>
<form action="<?php echo $_SERVER['PHP_SELF'] ?>" method="post" style="color:#FFF">
<label for="sendername"><span style="color:#9A24FF;font-size:22px">*</span> Your Name</label><br/>
<input type="text" name="sendername" required="required" />
<br/><br/>
<label for="senderemail"><span style="color:#9A24FF;font-size:22px">*</span> Your Email</label><br/>
<input type="text" name="senderemail" required="required" />
<br/><br/>
<label for="contactreason">Issue Type</label><br/>
<select name="contactreason" >
<option value="0" selected="selected">* Select Reason *</option>
<option value="bug">Calendar App Bug</option>
<option value="question">Question About Calendar</option>
<option value="other">Other</option>
</select>
<br/><br/>
<p>If reporting a bug, PLEASE include following information</p>
<label for="browser">Type of Browser Used During Error</label><br/>
<select name="browser" >
<option value="0" selected="selected">* Select Your Browser *</option>
<option value="chrome">Chrome</option>
<option value="firefox">Firefox</option>
<option value="safariwindows">Safari Windows</option>
<option value="safariapple">Safari Apple</option>
<option value="IE">Internet Explorer</option>
<option value="other">Other [incl in comments]</option>
<option value="unsure">Unsure</option>
</select>
<br/><br/>
<label for="device">Your Device</label><br/>
<select name="device" >
<option value="0" selected="selected">* Select Your Device *</option>
<option value="pc">PC (desk- or lap-top)</option>
<option value="ipad">iPad</option>
<option value="iphone">iPhone</option>
<option value="unsure">Unsure</option>
</select><br/>
<p>Below, describe in detail the date, what you were doing at the time of the issue, and what the app did or failed to do</p>
<hr>
<label for="comments"><span style="color:#9A24FF;font-size:22px">*</span> Details</label><br/><br/>
<textarea cols="39" rows="13" name="comments" style="color:#071C3D;padding:4px; font-size:17px" required></textarea>
<br/><br/>
<div style="text-align:center">
<input type="submit" value="Submit Form" name="formsubmitted" />
</div>

</form>
<?php

if($_POST["formsubmitted"]){
	//form has been submitted
	
	$dataArray = $_POST;
	
	foreach($dataArray as $k=>$answer){
		
		if(isset($answer) && ($answer != '' || $answer != NULL)){
			$$k = $answer; //using variable variables
		}		
	}
	
	$recipient = 'chris@customsigncenter.com';
	$subject = $contactreason;
	
    $from = $sendername . " <".$senderemail.">";
    
    $email_body = "<html><head></head><body>";		
    $email_body .= "<div>" . $comments . "</div> \r\n"; 
    $email_body .= "<h2>WIP Calendar Bug Report or Support Request</h2>  \r\n"; 
    $email_body .= "<p style=\"text-align:center; color:#3803A9\">Sender's Name and Email: " .$sendername . ", " . $senderemail . "<br/> \r\n"; 	
    $email_body .= "Reason For Contact: ". $contactreason ."<br/> \r\n";
    $email_body .= "Opt (if bug report) My Browser: ". $browser ."<br/> \r\n";
    $email_body .= "Opt (if bug report) My Device: ". $device ."<br/> \r\n";
    $email_body .= "</p> \r\n";		
    $email_body .= "</body> </html>";
    
    //convert new lines into <br> tags:
    $email_body = nl2br($email_body);

    $hdr = "From: " . $senderemail . "\r\n";
    $hdr .= "Reply-To: ". $senderemail ."\r\n";
    
    //	$hdr .= "bcc: someone@somewhere.com \r\n"; 	
    
    $hdr .= "MIME-Version: 1.0"."\r\n";
    $hdr .= "Content-type: text/html; charset=iso-8859-1"."\r\n";
    $hdr .= "X-Mailer: PHP/" . phpversion();
    
    
    mail($recipient, $subject, $email_body, $hdr, '-f ' . $senderemail);        

	
	
}

?>

</div>
</body>
</html>