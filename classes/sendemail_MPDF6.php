<?php
/**
  * /classes/sendmail.php
  * processes email form submitted via AJAX from /calendar/index.php
  * Chris Nichols - July14, 2016.
**/


DEFINE('DS', DIRECTORY_SEPARATOR);
//include '..'. DS .'..'. DS .'..'. DS .'classes'.DS.'dbconn.php';
//$mysql = new dbConn; 
//$db = $mysql->dbOpen('custo299_signdr');

include('..'. DS .'lib'. DS .'mpdf60'. DS .'mpdf.php');
$mpdf=new mPDF('','A4-L', 0, '', 10, 10, 12, 12, 8, 8, 'L');//array is dimensions wxh in mm.
$css = file_get_contents('http://customsigncenter.com/calendar/styles/bootstrap.min.css');
$css .= file_get_contents('http://customsigncenter.com/calendar/styles/print_1.css');
$css .= file_get_contents('http://customsigncenter.com/calendar/assets/icomoon/style.css');	
$css .= '<style>i[class^="ic-"]{ font-family: icomoon; }</style>';

$mpdf->WriteHTML($css,1);
sendMail($mpdf);

	function sendMail($mpdf) 
	{	//$data = file_get_contents('php://input');
		//$postVars = array();
		
		$type = 'email'; //contact type is by email
		$postVars = json_decode($_POST['data'], true);
		/*$arRecipients = array();			
		
		foreach($_POST['recipients'] as $e)
		{
			array_push($arRecipients, $e);
		}
		*/
		$company = $_POST['company'];
		$calendar = $_POST['calendar']; //calendar HTML
		$subject = 'Install WIP Calendar Update -- '. $company;
		$signature = "Tabitha Turner";
		//unhide the print div to show the cal in the email's html:
		$p = '~(id="print" class="hide")~'; //find; remove hide class from wrapper.
		$calendar=preg_replace($p, 'id="print"', $calendar);
		
		
		$mpdf->WriteHTML(utf8_encode($calendar), 2);
		//$mpdf->WriteHTML(utf8_encode($calendar));
		$content = $mpdf->Output('', 'S');// the S is to email this pdf.
		$content = chunk_split(base64_encode($content));
				
		
		//$from = $fromname . " <".$emailfrom.">";
		//$from = 'Install Schedule <no-reply@customsigncenter.com>';
		$from = "tturner@customsigncenter.com";
		$mailto = "chris@customsigncenter.com";
		$email_body = "<html><head>
		</head><body>";		
		$email_body .= "<h3 style=\"text-align:center; color:#3803A9\">Updated Installation Schedule for ".$company."</h3> <hr />\r\n";
		$email_body .= "<p>Calendar Attached as PDF</p> \r\n";	
		$email_body .= "<p style=\"text-align:center; color:#3803A9\">You may also view this calendar with most recent updates at: <a href=\"http:". 
		DS.DS."customsigncenter.com".DS."calendar\">Open Calendar in FireFox, Chrome or Safari</a>.</p> \r\n";
		$email_body .= $signature."\r\n";
		$email_body .= "</body> </html>";
		
		//convert new lines into <br> tags:
		$email_body = nl2br($email_body);
		
		$filename = "calendar.pdf";//.date("d-m-Y_H-i",time()); //Your Filename with local date and time
		//Headers of PDF and e-mail
		$boundary = "XYZ-" . date("dmYis") . "-ZYX";
		$header = "--$boundary\r\n";
		$header .= "Content-Transfer-Encoding: 8bits\r\n";
		$header .= "Content-Type: text/html; charset=ISO-8859-1\r\n\r\n"; // or utf-8
		$header .= "$email_body\r\n";
		$header .= "--$boundary\r\n";
		$header .= "Content-Type: application/pdf; name=\"".$filename."\"\r\n";
		$header .= "Content-Disposition: attachment; filename=\"".$filename."\"\r\n";
		$header .= "Content-Transfer-Encoding: base64\r\n\r\n";
		$header .= "$content\r\n";
		$header .= "--$boundary--\r\n";
		$header2 = "MIME-Version: 1.0\r\n";
		$header2 .= "Reply-To: tturner@csctransportationllc.com \r\n";
		if(!empty($_POST['recipients']) && $_POST['recipients'] !== NULL){
			$bcc .= "bcc: "; 
			foreach($_POST['recipients'] as $email){
				$bcc .= $email . ",";
			}
			$bcc = substr($bcc, 0, -1); //trim the trailing comma
			$bcc .= "\r\n";
		}
		$header2 .= $bcc;
		$header2 .= "From: ".$from." \r\n";
		$header2 .= "Return-Path: $from\r\n";
		$header2 .= "Content-type: multipart/mixed; boundary=\"$boundary\"\r\n";		
		$header2 .= "$boundary\r\n";
		mail($mailto,$subject,$header,$header2, "-r".$from);
		
		$mpdf->Output($filename,'I');
		
		
		
		
		
		
		
		
		
	/*	
		
		
		
		
		$hdr = "From: " . $from . "\r\n";
		$hdr .= "Reply-To: tturner@csctransportationllc.com \r\n";
		if(!empty($_POST['recipients']) && $_POST['recipients'] !== NULL){
			$hdr .= "bcc: "; 
			foreach($_POST['recipients'] as $email){
				$hdr .= $email . ",";
			}
			$hdr = substr($hdr, 0, -1); //trim the trailing comma
			$hdr .= " \r\n";
		}
		if(!empty($cc) && $cc !== NULL){
			$hdr .= "cc: ". $cc . "\r\n";
		}
		$hdr .= "MIME-Version: 1.0"."\r\n";
		$hdr .= "Content-type: text/html; charset=iso-8859-1"."\r\n";
		$hdr .= "X-Mailer: PHP/" . phpversion();
		
		//@mail($recipientList, $email_subject, $email_body, $headers ); //to, subj, body, other info for the hdr 		
		$subject = 'Install WIP Calendar Update -- '. $company;
		/*
		foreach($recipientList as $recipient)
		{
		*/
		//to, subj, body, other info for the hdr 
		//mail('chris@customsigncenter.com', "$subject", $email_body, $hdr);    
		// some servers require '-f' flag: mail('chris@customsigncenter.com', "$subject", $email_body, $hdr, '-f ' . $emailfrom  ); 
		/*
		}	
		*/	
		//prepare response:
		
		$respData = array();
		$respData['subject'] = 'Calendar Email Sent';				
		echo json_encode($arRespns);
		
		
	}	
	
	
?>