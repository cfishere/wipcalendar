<?php
/**
  * /classes/sendmail.php
  * processes email form submitted via AJAX from /calendar/index.php
  * Chris Nichols - July14, 2016.
**/

//var_dump($_POST);exit;
require_once $_SERVER['DOCUMENT_ROOT'] . '/calendar/vendor/autoload.php';

//to support icomoon fonts, we need to configure mPDF to recognize it:

$defaultConfig = (new Mpdf\Config\ConfigVariables())->getDefaults();
$fontDirs = $defaultConfig['fontDir'];

$defaultFontConfig = (new Mpdf\Config\FontVariables())->getDefaults();
$fontData = $defaultFontConfig['fontdata'];

$mpdf = new \Mpdf\Mpdf([
    'fontDir' => array_merge($fontDirs, [
        '../vendor/resources/fonts',
    ]),
    'fontdata' => $fontData + [
        'icomoon' => [
            'R' => 'icomoon.ttf',
        ],
    ],
    'format' => 'A4-L',
	'orientation' => 'L',
	'debug' => false,
	'list_auto_mode' => 'browser'
]);

/*

$mpdf = new \Mpdf\Mpdf([	
	'format' => 'A4-L',
	'orientation' => 'L',
	'debug' => true,
]);
*/

/* style sheets needed */


/*$css .= file_get_contents('http://customsigncenter.com/calendar/styles/icomoon-imgs.css');*/


$css = file_get_contents('http://customsigncenter.com/calendar/styles/print_1.css');
$css .= file_get_contents('http://customsigncenter.com/calendar/styles/pdf.css');
$css .= file_get_contents('http://customsigncenter.com/calendar/assets/icomoon/style.css');



$mpdf->WriteHTML(utf8_encode($css),1);

$content = '<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Calendar PDF</title>
    <style>'.
       $css.'
    </style>
</head>
<body style="border:0;margin:0;">';

/*body of the WIP calendar html: */
$calendar = $_POST['calendar']; //calendar HTML
$p = '~(id="print" class="hide")~'; //find; remove hide class from wrapper.
$calendar = preg_replace($p, 'id="print"', $calendar);
//$calendar = cleaupUnnecessaryHtmlItems($calendar);


/* debug broken images ***********
$calendar = '<span>Here is the same image as a background but now with a path relative to the CSS file location and in a div:</span>
<div style="width:400px;height:300px" class="ups-relativepath"></div>
<br><br><br>,<br>
<span>Same as above, but now as a span:</span><br><br><br>
<span style="width:200px;height:200px" class="ups-relativepath"></div>
';
*****************************/

$calendar = fixFontGlyphsForPdfDoc($calendar);

$mpdf->WriteHTML( utf8_encode($calendar), 2);


// Convert the HTML string to a PDF using those parameters.  Note if you have a very long HTML string use POST rather than get.  See example #5
/*
$apikey = "934e09f3-f88c-46cc-9e12-28234025fd77";

$postdata = http_build_query(
    array(
        'apikey' => $apikey,
        'value' => $content,
        'MarginBottom' => '30',
        'MarginTop' => '20'
    )
);
 
$opts = array('http' =>
    array(
        'method'  => 'POST',
        'header'  => 'Content-type: application/x-www-form-urlencoded',
        'content' => $postdata
    )
);


$context  = stream_context_create($opts);
 
// Convert the HTML string to a PDF using those parameters
//$result = file_get_contents('http://api.html2pdfrocket.com/pdf', false, $context);

*/
 
// Save to root folder in website
//file_put_contents('wip-calendar.html', $content);
//exit;


sendMail($mpdf);

	function sendMail($mpdf) 
	{	
		$content;
		
		try {
    		$content = $mpdf->Output('', 'S');// the S is to email this pdf.
		} catch (\Mpdf\MpdfException $e) { // Note: safer fully qualified exception name used for catch
    		// Process the exception, log, print etc.
    		echo $e->getMessage();
			
		}				
		$content = chunk_split(base64_encode($content));	
		$company = $_POST['company'];	
		$subject = 'WIP Calendar Update -- '. $company;
		$customMsg = ( empty($_POST['formData']['message']) ? '' : 'Sender\'s Note:<br>'.$_POST['formData']['message'].'<br>[End Sender\'s Note]<br><br>');	
		$from = ( empty($_POST['formData']['fromEmail']) ? 'careteam@customsigncenter.com' : $_POST['formData']['fromEmail']);	
		
		
		
		
		$signature = "WIP Calendar Admin";	
		
		//$from = $fromname . " <".$emailfrom.">";
		//$from = 'Install Schedule <no-reply@customsigncenter.com>';
		
		$mailto = 'chris@customsigncenter.com';
		$email_body = "<html><head><link href=\"customsigncenter.com/calendar/styles/print.css\" rel=\"stylesheet\"></head><body>";		
		$email_body .= "<h3 style=\"text-align:center; color:#3803A9\">Updated Installation Schedule for ".$company."</h3> <hr />\r\n";
		$email_body .= "<p>".$customMsg."Calendar Attached as PDF</p> \r\n";	
		$email_body .= "<p style=\"text-align:center; color:#3803A9\">You may also view this calendar with most recent updates at: <a href=\"http://customsigncenter.com/calendar\">Open Calendar in FireFox, Chrome or Safari</a>.</p> \r\n";
		$email_body .= $signature."\r\n";
		$email_body .= "</body> </html>";
		$bcc = 'chris@customsigncenter.com';
		//convert new lines into <br> tags:
		$email_body = nl2br($email_body);
		
		$filename = "WIP-calendar-".str_replace(' ','-',$company)."-".
			date("d-m-Y_H-i",time()).".pdf";//.date("d-m-Y_H-i",time()); //Your Filename with local date and time
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
		
		//prepare response:		
		$respData = array();
		$respData['subject'] = 'Calendar Email Sent';				
		echo json_encode($respData);		
	}	


/***
	write into each parent html element the icon font entity before 
	loading the html into mpdf
***/
	function fixFontGlyphsForPdfDoc($calendar)
	{
		//classname => font entity to embed:
		$fontEntities = array(
		"ic-ups" => "&#xe908;",
		"ic-i-ret-trip" => "&#xe901;",
		"ic-i-comp-inv" => "&#xe902;",
		"ic-i-comp-alt" => "&#xe903;",
		"ic-i-crane" => "&#xe904;",
		"ic-p-appr" => "&#xe905;",
		"ic-p-inf" => "&#xe906;",
		"ic-p-insp-appr" => "&#xe907;",
		"ic-p-insp-req" => "&#xe900;",
		"ic-users" => "&#xe94b;",
		"ic-flag" => "&#xe933;",
		"ic-cog" => "&#xe92d;");//or * = &#x2731 ? 0r &#xf069 ?
		
		$style = 'style="font-family: icomoon" ';
		// match all in html str for each key (class name for parent html el)
		// ex str found: 'ic-ups' IN <i class="ic-ups"></i>
		// Objective is to insert the entity value betw/ '><' using the
		// offset value of $matches arr (see below)
		
		foreach( $fontEntities as $cssClass => $fontEntity )
		{   //look for (example) '<i class="ic-ups"></i>', ignore whitespaces:
			/*   Escape:   \ ^ . $ | ( ) [ ] * + ? { } ,       */
			//$needle = '<i class="'. $cssClass .'"></i>','<i class="'. $cssClass .'"> </i>';
			$replacement = '<span '. $style .' class="'. $cssClass .'">'. $fontEntity .'</span>'; 
			//! Some needles may have white space between the tags.
			$calendar = preg_replace('~(<i class="'. $cssClass .'">\s*<\/i>)~', $replacement, $calendar);	
		}
		//  Our icomoon font glyphs do not incl an asterisk, so we're using an entity to display it.
		//  therefore, the aster. won't display in the PDF when the $style is being applied to the element.
		//  "ic-asterisk" => "&#x2a;" this arr el won't work when there is the font-family: icomoon style.
		//  so this most be replaced outside the foreach.
		$calendar = preg_replace('~(<i class="ic-asterisk">\s*<\/i>)~', 
								'<i class="ic-asterisk" style="padding: 0 4px;">&#x2a;</i>', $calendar);
		
		//some li tags end with "style>", which could cause an issue with mPDF
		$calendar = str_replace( "style>", ">", $calendar );
		
		//var_dump($calendar);
		return $calendar;
		
	}

function cleaupUnnecessaryHtmlItems($calendar)
{
	$count=array('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22');
	
	foreach($count as $c)
	{
		$calendar = str_replace('<img onclick="modalOpen(this,\'day\')" src="/calendar/assets/write-circle-green-128.png" title="edit" class="modalImg" id="d'.$c.'">', '', $calendar);
	}
	
	return $calendar;
}
	
?>