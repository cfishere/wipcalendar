<?php  			
header("Expires: Sat, 1 Jan 2005 00:00:00 GMT");
header("Last-Modified: ".gmdate( "D, d M Y H:i:s")."GMT");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
//error_reporting(E_ALL);
require_once('classes/security1.php');
require_once('classes/active_token1.php');
$ua = new userAuthenticate; //session start should be called by its parent, Session.
if(!isset($_SESSION)){	
	$s = new Session;
	//echo 'Developer Notification: A new Session created and session.php loaded.';
}
//var_dump($_SESSION['user']);
if( $ua->tokenSet( (integer)$_SESSION['user']['userId'], (integer)$_SESSION['user']['company'] ) === false ){	
	header('Location: login1.php');
	//echo "userId is " . $_SESSION['user']['userId'] . " and company id is " . $_SESSION['user']['company'];
	//outputs: userId is 1 and company id is 10	
}
//get array of all logged in users:
//returns empty array, or users with assoc indices of 'username','email',
$loggedUserList = $ua->getLoggedUsersList($_SESSION['user']['userId']);
$loggedUsers = '';
if(!empty( $loggedUserList )){
	$loggedUsers .= "<h4>Logged In</h4><p>Username, Email, Role<br/>";
	
	foreach($loggedUserList[0] as $lu){
		$loggedUsers .= $lu['username'] . ", " . $lu['email']. ", ". $lu['role']."<br/>";
	}
	$loggedUsers .= "</p>";
}else{
	$loggedUsers = "No Logged In Users.";
}
//
//active token class obj:
$tkn = new Active_Token;
//$userTokenArray = $tkn->tokenUsers();
//return an array of any access_token holders to display.
//$userProfiles='';
/*
if(!empty( $userTokenArray) ){		
	$userProfiles .= "<p class=\"hidePrint\"><strong>Admins &amp; Mgrs Logged In:</strong>";
	foreach($userTokenArray['list'] as $key=>$userInfo){			
		$userProfiles .= "<li>".$userTokenArray['list'][$key]['username'] . ",  ".$userTokenArray['list'][$key]['role']."</li>";
	} 
	$userProfiles .= "</ul></p>";
}
else {
		$userProfiles .= "<p><strong>Current Calendar Logins:</strong><br/>Just You</p>";
	}
	*/
if($_SESSION['user']){ $ses = $_SESSION['user']; }
// js console.log(json_encode($ses)) = { name: "chris", role: "admin", userId: 1, company: "All" }
// possible values of 'company': (str) All,0,1,2,3,4 (equating to: *,csc,boy,mar,out,jg)
// special company when logging into dev directory app is "Developer" which nevers claims the
// admin token from db.

if( $_SESSION['user']['role'] && $_SESSION['user']['role'] !== 'admin' && $_SESSION['user']['role'] !== 'mgr' && $_SESSION['user']['role'] !== 'Developer' ){
	//$user = unserialize($_SESSION['user']);
	//print_r($_SESSION['user']);
      if($_SESSION['user']['role'] === 'user'){
			//$_SESSION["user"] = array('name' => $_SESSION['user']['name'], 'role' => $_SESSION['user']['role']);
			$userURI = '';
			if(!empty($_SESSION['user']['name'])){
				$userURI = '?user='.$_SESSION['user']['name'];
				//$userURI .= '&role='.$_SESSION['user']['role'];
				header('Location: view.php' . $userURI);
			} else {
				header('Location: login1.php');
			}

			//echo $sesID;	TESTED: This new session start id does match the one in the uri from prior page.
			//and matches the one in the database for the active session.
			//if(!empty($query['sid'])) { $sesURI .= $query['sid'];}else{ $sesURI = '';};	
	 }
} else {comm

	if($_SESSION['user']['role'] === 'Developer' || $_SESSION['user']['role'] === 'admin'){
		$role = 'admin';		
	} elseif($_SESSION['user']['role'] === 'mgr'){
		$role = 'mgr';
	}

	$roleBasedJsFile = ( $role === 'admin' ? 'admin1.js?x=3' : 'mgr.js?x=3');
	//if($query['user']){
	//$username =  $query['user'];
	$username = $_SESSION['user']['name'];	
	session_id() != NULL ? $sesID = session_id() : $sesID = '' ;

} 


//'company' is either "ALL" to view all companies (special admin), 
// or num char (0=csc, etc) to view calendar for 1 company.
if( isset( $_SESSION['user']['company'] ) ){

	switch( $_SESSION['user']['company'] ){

		case '10':
			$coHide = 'co_all';
			$curCo = 'All';
			break;	
		case 'ALL':
			$coHide = 'co_all';
			$curCo = 'All';
			break;
		case '0':
			$coHide = 'co_csc';
			$curCo = 'Custom Sign Center';
			break;
		case '1':
			$coHide = 'co_boy';
			$curCo = 'Boyer Signs';
			break;
		case '2':
			$coHide = 'co_mar';
			$curCo = 'Marion Signs';
			break;
		case '3':
			$coHide = 'co_out';
			$curCo = 'Outdoor Images';
			break;
		case '4':
			$coHide = 'co_jg';
			$curCo = 'JG Signs';
			break;

	}
}
?>

<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Import CASper CSV to WIP Calendar</title>
<link href="styles/calendar.css" rel="stylesheet">
<link href='https://fonts.googleapis.com/css?family=Kaushan+Script&effect=3d-float' rel='stylesheet' type='text/css'>
<style>
body{margin:0px;}
.menu{
float:left; width:100%; border-bottom: #288D9A 2px solid; margin-bottom: 30px;
background: rgb(230,240,163); /* Old browsers */
background: -moz-linear-gradient(top, rgba(230,240,163,1) 0%, rgba(210,230,56,1) 38%, rgba(195,216,37,1) 51%, rgba(219,240,67,1) 100%); /* FF3.6-15 */
background: -webkit-linear-gradient(top, rgba(230,240,163,1) 0%,rgba(210,230,56,1) 38%,rgba(195,216,37,1) 51%,rgba(219,240,67,1) 100%); /* Chrome10-25,Safari5.1-6 */
background: linear-gradient(to bottom, rgba(230,240,163,1) 0%,rgba(210,230,56,1) 38%,rgba(195,216,37,1) 51%,rgba(219,240,67,1) 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e6f0a3', endColorstr='#dbf043',GradientType=0 ); /* IE6-9 */
}
.menu img {cursor:pointer; float:left; margin: 20px 30px; margin-left: 34%};

</style>

<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>

<script>
var file;
//on document load.
$(function() {	
	var today = new Date(); //date obj
	var cDate = today.getDate(); //current date.
    	var m = today.getMonth()+1; //month is zero-based (+1)	
    	var y = today.getFullYear();
	// 01_31_2016	for hiddne POST field.
	var cD = m+"_"+cDate+"_"+y;
	//display the date 01/31/2016
	var formatedDate = m+"/"+cDate+"/"+y;
	$("#curDate").html(cD);
	$("#date").html(formatedDate);	
	
	//get the time:
      var hours = today.getHours();
      var minutes = today.getMinutes();
	 //no leading zeros for minutes less than 10.
	 //fix:
	 
	 if(minutes < 10){
		 minutes = "0"+minutes;
	 }	 
	 
      var period = "AM";
      if (hours > 12) {
         period = "PM"
      }
      else {
         period = "AM";
     }
	var cTime = hours+":"+minutes+" "+period;
	$("#curTime").html(cTime);
	
});
//delete an existing csv file from the server.

function deletecsv(file){
	
/*
	readyState 	Holds the status of the XMLHttpRequest. Changes from 0 to 4:
	   0: request not initialized
	   1: server connection established
	   2: request received
	   3: processing request
	   4: request finished and response is ready
	   
	 status 	200: "OK"
	   404: Page not found
*/
/*
    var data={"file":file};
	
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
	    
        if (xhttp.readyState == 4 && xhttp.status == 200) {
		   giveNotice('<span style="color: #009000">Success</span>: '+ xhttp.responseText +'.');
        }
    };
    xhttp.open("GET", "ajax_info.txt", true);
    xhttp.send();
*/	
	
	
	
	//ajax call to delete file.
	var data={"file":file};
	
	//update the appropriate cell node in the xml
	$.ajax({	
		  url : "classes/filedelete.php",
		  method: "POST",
		  data : data
		  //dataType:"json",		  
	 })		  
	 .done (function(response, textStatus, jqXHR) { 
		giveNotice('<span style="color: #009000">Success</span>: '+response+'.'); 
	 })
	 .fail (function(jqXHR, textStatus, errorThrown) { 
		giveNotice('<span style="color: #FF0000">Failed</span>: Server Responsed: "'+errorThrown+'"');
	 })
	 .always (function(jqXHROrData, textStatus, jqXHROrErrorThrown) { 
		giveNotice('<span style="color: #009000">Completed</span>'); 
		$("#phpMsg").html(''); //hide the delete file message.
	 });
}
function giveNotice(message){
	
	$( "div#message" ).fadeIn( 'slow', function(){
	    $( "div#message" ).css("display", "inherit");
	    $( "div#message" ).css("padding", "12px");
	    $( "div#message" ).css("height", "auto");
	    $( "div#message" ).html("<p>"+message+"</p>");
	}).delay( 1900 ).fadeOut('slow' );
	$( "div#message" ).css("display", "none");
	$( "div#message" ).css("padding", "0px");
	$( "div#message" ).css("height", "0px");
}

</script>
</head>
<body>
<div class="menu">

<a href="http://customsigncenter.com/calendar/"><img src="assets/ico-calendarcell.png" title="Open WIP Calendar" style="width: 60px" /></a>
<div style="text-align:center; float:left;margin-top: 40px"><span style="padding:5px 8px;color:#4911D0">Today: <span id="date"></span> [ <span id="curTime"></span> ]</span></div>
</div>
<div class="content-row">

	<h1 style="margin: 9px auto 0px auto;text-align:center;color:#8AC72D">Import CASper CSV File</h1>
	<h3 style="margin: 9px auto 30px auto;text-align:center;color:#7EAB26">WIP Calendar [ <a href="importhelp.html" target="_blank" title="Opens instructions in a new window">help</a> ]</h3> 
     <div style="text-align:center">  
    
     <div style="height:0;display:none" id="message"></div>
      <!-- The data encoding type MUST be specified mutlipart/form-data -->
		 
		 <?php if($username) { 
			echo "<div style=\"margin: 2px auto 8px auto;;font-size:18px;color:#8AC72D\" class=\"cursive\">Welcome <span id=\"username\">". $username ." <span style='font-family:san-serif'>&nbsp;(".$role.").</span></span></div>
			<form action=\"login1.php\" method=\"POST\" name=\"logoutform\" id=\"logoutform\" >
				<input type=\"hidden\" value=\"".$username."\" name=\"loggedOutUser\" />
				<input class=\"smBtn\" type=\"submit\" value=\"logout\" name=\"logout\" />
			</form>
			<br/>";
			
			if( !empty( $_GET['editor']) ){
				echo "<br/>The Only user with Editor-Rights Is: " . $_GET['editor'] . ", login time: ".$_GET['authtime'];				
			} 
			echo $loggedUsers;			
		} else {
			$username = 'user';
		} ?>
     
    <form action="<?php $_SERVER['PHP_SELF']; ?>" method="post" name="loadCalendar" enctype="multipart/form-data" id="loadCalendarForm" style="width:480px; margin: 30px auto; text-align:left; padding:20px; border-radius:9px; border: #E3ECD3 solid 1px">
    <div style="text-align:center">
    <p class="formLabel">Choose a Company Calendar to Update</p>
         <select name="companyCalendar" id="companyCalendar" >
              <option value="Custom Sign Center" selected>Custom Sign Center</option>
              <option value="JG Signs">JG Signs</option>
              <option value="Marion Signs">Marion Signs</option>          
              <option value="Boyer Signs">Boyer Signs</option>
              <option value="Outdoor Images">Outdoor Images</option>
           </select> 
           
           <br/><br/>       
           <input type="hidden" name="mm_dd_yyyy" id="curDate" value="" />
           <input type="hidden" name="m" id="month" value="" />
           
            <!-- MAX_FILE_SIZE must precede the file input field -->
          <input type="hidden" name="MAX_FILE_SIZE" value="300000" />
          <!-- Name of input element determines name in $_FILES array -->
         
          <span class="formLabel">Send this file: &nbsp;</span> <input class="smBtn" name="userfile" type="file" multiple /> 
       </div>
<br/><br/><br/>

          <div style="text-align:center"><input class="smBtn"  type="submit" value="Import CSV to Calendar" style="width:190px;" /></div>  
  </form></div>
  <br/><br/>
  <span style="color: #8C8C8C;font-size:15px;">Footnotes:</span>
  <hr/>
   
  <div style="width:480px;color: #B73234; margin: 10px auto">
  <p><strong>Note</strong>: This will <em>NOT</em> overwrite, only update, <br/>a Calendar with the csv data.</p>
          Example CSV File Structure:<br/>
          <blockquote style="font-style:italic">    
          InvcNum,DueDate,ShipToName
1129-1,5/23/2018,ROSS Stores Inc c/o Bill Moore & Associates<br/>
1148-9,4/23/2018,Egan Sign / Famous Footwear #3580<br/>         
                     ... et cetera.
                     </blockquote>
</div>

 <p style="text-align:right;color: #8C8C8C; margin-top: 60px;font-size:13px;font-style:italic">2015 - <?php echo date('Y') ?> &copy; Custom Sign Center, Inc. -- All Rights Reserved.</p>  
 </div>
 

</body>
</html>

<?php //import csv file and create or save to the calendar.xml
DEFINE('DS', DIRECTORY_SEPARATOR); 

/* 	1. 	(up)Load a csv file of WIPs as a resource using html form controls.
	2.	Build csv data into well-formed assoc array
	3.	Load XML file as resource
	4.	Iterate through array:
			a. Update where mm/dd/yyyy node exists
			b. Create node where required, expanding the calendar.
	5.	Save XML with success message.
/*

/*
CSV may look similar to this:
job, custName, deadline
job0001,Sunoco,5/1/2016
job0002,Marathon,5/1/2016
job0003,Shell,5/2/2016
*/

//First, build into arrays by deadline values

//test data 
/*
$string_csv = 
'job0001,Sunoco,5/1/2016
job0002,Marathon,5/1/2016
job0004,Shell,5/2/2016
job0005,Shell on High,4/3/2016
job0006,Donatos,5/1/2016
job007,Maxwell\'s,3/04/2014';
*/


  
  
  // IF A FILE HAS BEEN UPLOADED
  if (!empty($_FILES))
  { 
  	// error_reporting(E_ALL);
 	libxml_use_internal_errors(true);
	// DEBUG: print_r($_FILES);
	 
	// save to the remote server
  	$save = new saveToCalendar;
	
	// upload csv.  Returns path to file.
	$file = $save->a();
	
	// parse csv file into array
	$save->b($file);
	/*if($arCSV === false){		
		$save->endMsg('Faild to open the uploaded csv file');
	}*/
	
	// Set class properties to POST value(s)
	$save->c();
	
	// Open XML resource.  Get node for correct day.  Write csv value to the day.
	$save->d();
	  	 
  }
  
class buildNewMonthNode{
	
    //build array of dates for requested company->year->month for calendar.xml
    //public $datesArray = array();
   
	
}//end buildnewmonth class



class saveToCalendar  {
	
	
	const APP_URL_PATH = "customsigncenter.com/calendar/";
	private $CSVrows = array(); // final csv array.
	private $month;
	private $year;
	private $date;
	private $msg='';
	private $csvPath; // full path to the uploaded csv file.
	private $xmlCompanyNode;
	private $xmlYearNode;
	private $xmlMonthNode;
	private $xmlDayNode;
	private $xmlJobNode;
	private $duplicateEntry = false;
	// POSTED NAME VALUES
	// May not need any of the date info posted below:
	private $cDate; // current date.
    	private $m; // current month	
    	// private $y; //current year
	private $mm_dd_yyyy; //mm_dd_year
	// MORE NAME VALUES POSTED BY THE FORM
	private $companyCalendar; // company name of calendar to update.
	private $MAX_FILE_SIZE;	
	public $doc;
	public $xmlfile; // xml file name to update
    	public $targetYear;
    	public $targetMonth;
	public $xpd; // xpath 
	public $allMonthNodes; // all the month nodes to search for duplicate entries in dates
	public $approot;
	public $modelsDir;
	//dirname(__FILE__) = home/custo299/public_html/calendar/dev for development folder
		
	function a(){
	   $origFileName = $_FILES["userfile"]["name"];
	   $temp = $_FILES["userfile"]["tmp_name"];
	   $this->approot = dirname(__FILE__)."/"; //e.g: C:\inetpub\wwwroot\customsigncenter.com\calendar\
	   if( preg_match('/wwwroot/', dirname(__FILE__) ))/* dirname(__FILE__)*/ {
		  // load the csv file from the calendar app root if using the dev. local version of site.		  	
		  $this->modelsDir = '/models/development/';	
		   
	   } elseif(preg_match('/dev/', dirname(__FILE__))) {
		   
		   $this->modelsDir = '/models/';
		    
		   
	   } else {		   
		 $this->modelsDir = '/models/';	 		
		   		   
	   }
	   $destFileName = $this->approot."csv/".$origFileName;
	   $csvFileName = $destFileName;
	   //won't be accessible if chmod is not set.
	    
	    chmod($this->approot."csv/", 0777);
	   if ( is_file($destFileName) ) { //if the file is already uploaded... presume this has been imported.
	   		chmod($this->approot."csv/", 0755);
	   		echo '<div id="phpMsg">'.$origFileName.' has already been imported once before.  <span style="cursor:pointer; color:#040073; text-decoration:underline;" onClick="deletecsv(\'csv/'.$origFileName.'\')">Delete</span> it or upload a different csv for importing.</div>';
			
	   }
	   else {
	   if (!$contents = file_put_contents($destFileName, file_get_contents($temp)))
		//if (!move_uploaded_file($_FILES["userfile"]["tmp_name"], $destFileName)) 
		{
			echo "CANNOT GET ". $origFileName . PHP_EOL;
			chmod($this->approot."csv/", 0755);
		} else
		{
			/*
			$contents = file_get_contents($destFileName);
			//echo "Here are the contents".$contents;			
			$this->msg= "<br><p>" . $origFileName. 
			" is ready for Importing to the Calendar.  Location: <em>/calendar/csv/" .
			$origFileName . "</em><p>";			
			$this->csvPath = $this->approot.'csv/'. $origFileName;
			*/
			
			//new way....
			//return $this->csvPath = $this->approot.'csv/'. $origFileName;
			
			
			
		  
			
			//$contents = file_get_contents($destFileName);
			//$file = new SplFileObject($destFileName, "r");
			//$fields = $file->fgetcsv($contents);
			//print_r($contents);
			
			//echo "Here are the contents".$contents;			
					
			$this->csvPath = $this->approot.'csv/'. $origFileName;
			//end new way.
			
			
		}
		echo "Success: The File Uploaded To: <strong>" . $this->csvPath . "</strong><br>";
		return $this->csvPath; 
	   }
	  // exit;
		
	}
	
	//build an array from the csv file's text fields:
	function b($file){		
	    //echo "csv path is: " . $this->csvPath;
		if (($handle = @fopen($file, "r")) !== FALSE) {
			   while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
				  $num = count($data);
				  //try to replace XML prohibited Ampersands [&], with html entity '&amp;'
				  $data = preg_replace('/&(?!;{6})/', '&amp;', $data);
				  array_push($this->CSVrows,$data);
				  //echo "<p> $num fields in this line: <br /></p>\n";
				 
				  /*for ($c=0; $c < $num; $c++) {
					 //echo $data[$c] . "<br />\n";					 
				   }*/
			   }
			   fclose($handle);
			   //print_r($this->CSVrows);
		    }
		    else {
			    echo '<br/>Function b, says that file ' . $file . ' could not be opened for reading.<br/>';
		    }
			
			
			array_shift($this->CSVrows); //remove headers row.
			
			//print_r($this->CSVrows); //echos correct dates here, but below the foreach, the dates are not correct.  They repeat .
			/* outputs :
			Array ( [0] => Array ( [0] => 92400 [1] => 12/30/2016 [2] => Noodles - Broomfield, CO ) 
			[1] => Array ( [0] => 94125 [1] => 10/17/2016 [2] => Wen # 11711- WO 94125 Mechanicsville VA ) [2] => Array.... */
			
			$i=0;
			//row fields from casper are ordered [0] job#, [1] due date, [3] shiptoname
			foreach($this->CSVrows as $row) {	
			    // 1st: create a new index called 'date' in the array from the chars between forw slashes: 5/1/2016 // which is 1
			    $patrn = '~\/(.*)\/~';//any character betw. forward slashes (i.e., the day of the month).
			    if( preg_match($patrn,$row[1],$matches) ){ //find the date	
			    	    // echo 'Pattern found and it is ' .	$matches[0] . ' for '. $row[1].'<br>';
				    $date = $matches[0]; //e.g., /21/		
				    $yr = substr(str_replace(' ', '', $row[1]),-4,4); //pull out the year
				    $patrn2 = '~[^\/]*~';//match all up to first '/' (not including /) to get the month
				    if( preg_match($patrn2,$row[1],$matches2) ){
					   $mo = $matches2[0];
				    }
				    // $row[2] = str_replace($date,'_',$row[2]); //replace '/21/' from 5/21/2016 with '_'
				    $date = str_replace('/','',$date);	// this /21/ to this 21					
			    }					
			    $this->CSVrows[$i]['date'] = $date;// 21
			    $this->CSVrows[$i]['month'] = $mo;
			    $this->CSVrows[$i]['year'] = $yr;
			    $this->CSVrows[$i]['job'] = $row[0];// 0345
			    //echo 'This job number is: '.$this->CSVrows[$i]['job'].'<br/>';
			    // xml does not allow '&' or '<' or '>'.  Replace ampersands with char encoded equivalent.
				
				
				/* To prevent any existing html entity '&amp;' from being replaced with '&amp;amp;'...
				 * 1st check that the str has not already replaced a '&' with '&amp;', and if false,
				 * then try to str replace any '&' chars with the html equivalent that is allowed in xml.
				 */
				
				//if( strpos($this->CSVrows[$i]['custName'], '&amp;'===false) ){
					//if there's any &'s, replace those with html entity equivalent:
					$this->CSVrows[$i]['custName'] = str_replace('&', '&amp;', $row[2]);// Marathon Gas
				//}			    
			    
			    //$this->CSVrows[$i]['deadline'] = $row[2];// 5_2016
			    unset($this->CSVrows[$i][0]);
			    unset($this->CSVrows[$i][1]);
			    unset($this->CSVrows[$i][2]);
			    //echo 'record #' .($i+1). ' is job ' .$this->CSVrows[$i]['job']. ' date is: ' . $mo . '/'. $date. '/' .$yr.' for cx: ' .$this->CSVrows[$i]['custName'].'<br>';
			    $i++;
			    
			}
		
			//print_r($this->CSVrows);
			/*print_r outputs array of arrays:
			
			[date] => 21 [month] => 4 [year] => 2017 [job] => 100994-1 [custName] => Wendy's Site #04938 ) 
			*/
	}
	
	function c(){
		//$k represents the class properties identically-named with the $_post assoc key names		
		if( isset($_POST['companyCalendar']) ){
			foreach($_POST as $k=>$v){
				$this->$k=$v;
			} 
		}else{
			echo 'Func c says there is no POST data.<br/>';
		}
			
	}//c()
	
	//open XML
	//create our xml node objects for writing to:
	function d(){
		
		switch($this->companyCalendar){			
			case 'Custom Sign Center':
			$this->xmlfile = 'csc.xml';
			break;
			case 'JG Signs':
			$this->xmlfile = 'jg.xml';
			break;
			case 'Marion Signs':
			$this->xmlfile = 'mar.xml';
			break;
			case 'Boyer Signs':
			$this->xmlfile = 'boy.xml';
			break;
			case 'Outdoor Images':
			$this->xmlfile = 'out.xml';
			break;			
				
		}		
		
		//echo 'xmlfile variable is now: ' . $this->xmlfile;
		
		 //$approot = "/home/custo299/public_html/calendar/";
		 
		 $opts = array('http' => array(
			 'user_agent' => 'PHP libxml agent',
		 ));
	 
		$context = stream_context_create($opts);
		libxml_set_streams_context($context);		
		
		 if (file_exists(realpath ( dirname(__FILE__) . $this->modelsDir . $this->xmlfile ))) 
		 {
			
			  $this->doc = new DOMDocument();	
			  $this->doc->formatOutput = TRUE;	
			  // echo 'Path is now ' . dirname(__FILE__) . 'models/'.$this->xmlfile . '<br/>';
			  
			  //http://de.php.net/manual/en/domdocument.load.php		
			  if( $this->doc->load(filter_var(realpath( dirname(__FILE__) . $this->modelsDir . $this->xmlfile )), LIBXML_NOBLANKS))
			  {	
				  //Locate the correct company calendar XML node for this request. 
				/*  for( $i = 0; $c = $this->doc->getElementsByTagName('calendar')->item($i); $i++ ) 
				  {					
					  if( $c->getAttribute("id") == $this->companyCalendar ) 
					  {
						  echo 'Company calendar node found :  ' . $c->getAttribute("id");
						  //exit;
						  if(is_object($c))
						  {
							  $this->xmlCompanyNode = $c; // obj node.  We have the Company Node for All Rows.
							  //echo "\r\n The Company Node is an object! <br/>";	
						  } else {
							  echo "\r\n The Company Node cannot be set as an object! <br/>";	
							  exit;
						  }
					  }						
				  }	*/			
				  
				  $this->xpd = new DOMXPath($this->doc); //used to do iterative queries over the children nodes of XML doc.
				  $this->allMonthNodes = $this->xpd->query("//month");
				  //company node in XML file.  No longer required with company-specific XML files.
				  $this->xmlCompanyNode = $this->doc->getElementsByTagName('calendar')->item(0);			  
				  
				  //calendar node is $this->xmlCompanyNode.
				 
				  foreach($this->CSVrows as $rowNmbr=>$csvRow)
				  { //get the year for this row, then the month, then date.
					  
					  	$this->xmlDayNode = $this->xmlJobNode = $this->xmlYearNode = $this->xmlMonthNode = null;
					  	
						  //***YR NODE******** get the XML year for this CSV row.
					       // Generally there is ONLY going to be ONE Yr Node in the XML 
						  for( $iYr = 0; $y = $this->xmlCompanyNode->getElementsByTagName('year')->item($iYr); $iYr++ ){
							  
							  //if exists, set as the node to access, else create the node
							  if((integer)$y->getAttribute('ordinal') === (integer)$csvRow['year']){						
								  $this->xmlYearNode = $y;	//We have the Year Node for this Row.
								  //echo "The year node has been set!";					
							  } //end for to get year.
						  }//end for
							  //if no matching year node found. create it in xml.
							  if(!isset($this->xmlYearNode))
							  {
								  echo '!isset($this->xmlYearNode for '.$csvRow["year"].'...call createNode()';
								  
								  // no matching year.  Create xml Calendar with ordianl year matching the import's yr.
								  //send parent: node parent obj, newNodeName, new node attrib name, new node attrib value.
								  //$this->xmlYearNode = $this->createNode($this->xmlCompanyNode, 'year', 'ordinal',  $csvRow['year']);
							  }// end if
							  // what if we still could not get or set a year node for this row...
							  if(!isset($this->xmlYearNode) || $this->xmlYearNode == NULL) {								
								  $this->msg .= "Some Records from the CSV file could not be written to the Calendar: \r\n";
								  $this->msg .= "Could not Access or Create a year node for csv year: " . $csvRow["year"] ."\r\n";
								  echo $msg;								
							  } //end if
							  else{ //we have our year node; get month node for the csv row:
								  
								  //***MO NODE******** Get the XML month node for this CSV row.
								  for( $iMo = 0; $m = $this->xmlYearNode->getElementsByTagName('month')->item($iMo); $iMo++ ){
									 // echo '<br/>Month is '.($iMo+1);
									  //echo '  <br/>Date is '. $csvRow['date'] . '<br/>';
									  echo '<br/>Job is '. $csvRow['job'].'<br/>';
									  if( (integer)$m->getAttribute('ordinal') === (integer)$csvRow['month'] ){										
										  $this->xmlMonthNode = $m;	
										  echo "Located Data Store for ". $this->xmlMonthNode->getAttribute('name')." <br/>";
										  
									
									  }
								  }
							  }
								  
							  if( isset($this->xmlMonthNode) && is_object($this->xmlMonthNode) ){

								  for($iWk=0; $wk=$this->xmlMonthNode->getElementsByTagName('week')->item($iWk); $iWk++) {

									 //***DATE NODE******** Get the XML date node for this CSV row.  

									  for($iDay = 0; $d = $wk->getElementsByTagName('day')->item($iDay); $iDay++) {
										  if( (integer)$d->getAttribute('date') === (integer)$csvRow['date'] ){	


											  $this->xmlDayNode = $d;	//We have the Day Node for this Row.
											 /* if(is_object($d)){
												  echo '$d is an obj <br/>';
											  } else {
												  echo '$d is NOT an obj <br/>';
											  }*/
											   /********* FIRST ******************/
											  /*  LET'S TRY TO REMOVE ALL CSV UPDATES THAT ALREADY HAVE A RECORD IN THE CURRENT XML DOCUMENT


											 //B4 appending new content to the old contents in the cal,
											 //we need to ensure that all new jobs are unique, and not already 
											 //saved someplace in the old calendar content.
											 //Use the span id (i.e., <span id="job_uniqueJobNumber">uniqueJobNumber</span> ) from 
											 //the old content, iterate over all of them, and then SKIP the new content update
											 //for any match betw/ new content's job number and any job number from the old content.

											 */
											  echo '<br>date node found.<br>';




										  } 
									    }//end for	day

							  	} //end for wk
								
							   } //end isset xmlmonthnode...
								  
								// got our (day), let's check job nodes for matching job # in this xml day node.
					  			// if a match is found, we can skip this csv job (i.e., dupEntry = true), and exit the for $ij loop

								$ptrn = (string)$csvRow['job'];
					  
					  			//reset the duplicateEntry global for this xml-csv date-matched nodes.
					  			$this->duplicateEntry = false;
					  			
					  			
					  			if($this->xmlDayNode === null){
									continue;
								}
					  
					  
								for($iJ = 0; $jNode = $this->xmlDayNode->getElementsByTagName('job')->item($iJ); $iJ++){		//if job node is null, skip this iteration    			
									if($jNode === null){
										continue;
									}
									//for each job node in xml.  Find any that match the job of this csv row

									// Compare the strings for identical match
									// 100100 and 100100-1 do not BOTH give a found result for 100100 searches.
									// AND allow for job="admin-note" to be skipped during this update

									$patterns = array( 0=>"copyo", 1=>"admin" );//1st 5 chars of 'copyof or admin-note								
									foreach( $patterns as $p )
									{
										//int strncasecmp ( string $str1 , string $str2 , int $len )
										//strncasecmp — Binary safe case-insensitive string comparison of the first n characters
										//Returns < 0 if str1 is less than str2; > 0 if str1 is greater than str2, and 0 if they are equal.
										if(strncasecmp($p, (string)$jNode->getAttribute('number'), 5) === 0)
										{  //ignore this job: it is a copyof or an admin note.									   
										   break;//break out of the if, foreach loops. 
										}												
									}
									if( strcmp((string)$csvRow['job'],(string)$jNode->getAttribute('number')) === 0 )
									{
										echo "Skipping Update, Job " . $csvRow['job'] .
										". Already exists in the Calendar.<br>";												
										$this->duplicateEntry = true;	
										break;//break out of the if.
										/* // DEBUG:  
										echo "duplicateEntry = " .$this->duplicateEntry."<br/>"; */											 
									} 

								}//for each job node in xml's matching date node for this csv row
				  

								//if still not found a job in xml matching csv's job...
								if($this->duplicateEntry === false){
									 echo "Extended Search Required for this Job<br>";
									 $result = array();
									 $result = $this->exhaustiveSearch($ptrn);

									 if( count($result) > 0 && !isset($result['assigned'])){

										 //got an array of unassigned job nodes that are duplicates
										 //to delete.
										 foreach($result as $r){
											echo 'Deleting array of duplicate jobs<br/>';
											$parent = $r->parentNode;
											$parent->removeChild($r);
										 }

										 echo "Array count(result) > 0; duplicate= true";
										 $this->duplicateEntry = false; //we need to add this job
									 } 
									if($result['assigned'] === 1){

										//there is at least one out there that is assigned for this job.
										$this->duplicateEntry = true;


									}



								}



								 if($this->duplicateEntry === false)
								 {	
										//update this record.
										echo "<br>Attempting to Add: Job No ".$csvRow['job']."<br>";					   
										//$this->updateDayNode($rowNmbr); //row to update


										//echo "the csvrow is set";
										$jobContent = '~~li class="lineEntry unassigned" title="Right-Click for Options" contenteditable="false" #$#  ~~i class="ic-flag"*#$# *^*i#$#	 ~~span id="job_'.
										$csvRow['job'].'" #$#' . $csvRow['job'] . '*^*span#$# ' . htmlspecialchars($csvRow['custName']) .'*^*li#$# ';
										//createElementNS ( string $namespaceURI , string $qualifiedName [, string $value ] )
										$newJobNode = $this->doc->createElement( 'job', $jobContent );

										$numAttrib = $this->doc->createAttribute('number');
										$numAttrib->value = (string)$csvRow['job'];

										//append attrib to element
										$newJobNode->appendChild($numAttrib);


									if(is_object($newJobNode))
									{										
										$this->xmlDayNode->appendChild($newJobNode);

									} else
									{
										echo "<br>A Problem Occurred: Could not append this job as required.<br>";
									}
								 } //if dupEnty === false

								 
				  }//foreach csv row
							  
				  //finally save this xml file.
				  //save the updated changes in the php resource to the xml	doc	
				  echo "<br>Saving the document.";
				  
				  //$this->doc->saveXML();
				   $this->doc->save(dirname(__FILE__) . $this->modelsDir . $this->xmlfile);
				  //$this->doc->asXML(dirname(__FILE__) . $this->modelsDir . $this->xmlfile);
						   
			}//end if
			else { //could not load the xml file
				echo "\r\n COULD NOT load the calendar.xml file!";
			}
						 
		 }//end if file exists
						
	}//end d()
	
	
	/* key for character encoding for my html angle brackets in this app:
		str_replace '</', '*^*'   
		str_replace '<', '~~'
		str_replace '/>', '$^$'
		str_replace '>', '#$#'
		
		Examples for xml imports:
		<br/> encodes to:  ~~br$^$	
		<li>  encodes to:  ~~li~~	
		</li> encodes to:  *^*li~~	
	*/
	
	
	
	//example data to add to day node: [job] => job0001 [custName] => Sunoco
	function updateDayNode($rowNmbr){
		echo "<br>Updatedaynode beginning:<br>";
		//$oldNodeVal = $this->xmlDayNode->nodeValue;
		
	//	if(isset($this->CSVrows[$rowNmbr])){
			//echo "the csvrow is set";
			$appendToNode = ' ~~li class="lineEntry unassigned" title="Right-Click for Options" contenteditable="false" #$#			
			~~i class="icons"*#$# *^*i#$#			
			~~span id="job_'.
			$this->CSVrows[$rowNmbr]['job'].'" #$#' . $this->CSVrows[$rowNmbr]['job'] . '*^*span#$# ' . htmlspecialchars($this->CSVrows[$rowNmbr]['custName']) .'*^*li#$# ';			
			$newJobNode = $this->doc->createElement( 'calendar', 'job', $appendToNode );
			$numAttrib = $this->doc->createAttribute('number');
			$numAttrib->value = (string)$this->CSVrows[$rowNmbr]['job'];
		
			//append attrib to element
			$newJobNode->appendChild($numAttrib);
		
		
		if(is_object($newJobNode)){
			//append elem to document	
			//ERROR THROWN "Call to a member function appendChild() on null" 
			//Error happens when adding to a date, that was previously added to.  It is messing up
			//the xml structure when each job is added.
			//each add alters tree to:
			/*
			
			<day xmlns="" ordinal="31" name="Tuesday" date="30"><job number="100100-1"> ~~li class="lineEntry unassigned" title="Right-Click for Options" #$#~~span id="job_100100-1" #$#100100-1*^*span#$# Mills Realty - Lancaster, OH*^*li#$# </job></day>
			
			*/
		     $n=$this->xmlDayNode->appendChild($newJobNode);
			
			//$this->doc->saveXML();
			//$this->doc->save(dirname(__FILE__) . $this->modelsDir . $this->xmlfile);
			//DEBUG.  Save xml on first found update:
			//$this->doc->save(dirname(__FILE__) . $this->modelsDir . $this->xmlfile);
			//Exit;
			
				 
		} else 
		{
			echo "<br>A Problem Occurred: Could not append this job as required.<br>";
		}	
		
	}//end updateDayNode()
	
						
	
	// THIS SHOULD ONLY BE CALLED IF THE NODE DOES NOT EXIST AS A DATE IN THE CALENDAR (whether a month, date, year)
					
	// node parent obj, newNodeName, new node attrib name, new node attrib value.
	function createNode($parentNode, $newNodeName, $newNodeAttribName, $newNodeAttribValue) {		
		
		//IF 'new month' Node...
			// THEN Let's just Create the whole darn Month in one Shot
			// Call the buildCalendar->createDates (for the month)
	    if( $newNodeName == 'month' ){ //build in all dates for the missing month node
		    $node = $this->createDates($parentNode, $newNodeName, $newNodeAttribName, $newNodeAttribValue);
		    return $node;
	    } else
	    {		
		  //newNodeName is the name of the node to create.  parent is the actual obj node to place new node.
		  $element = $this->doc->createElement($newNodeName); //always create elements using the domdocument obj, not a node obj therein.
		  $element->setAttribute($newNodeAttribName,$newNodeAttribValue);
		  $node = $parentNode->appendChild($element); //append it to the correct node.
		 // $elemAttrib = $element->setAttribute($newNodeAttribName,$newNodeAttribValue);
		  // Value for the created attribute
		  //$elemAttrib->value = $newNodeAttribValue;
		  //try save first, since you cannot find the node until it is saved:
		  $this->doc->saveXML($node);
		  
		  //how to set this as an obj node?  Try:
		  //should only be one, the new one created.
		  
		  foreach($node as $childNode)
		  {
		  //for($i=0;$childNode = $parentNode->getElementsByTagName($newNodeName)->items($i); $i++){
			  
			  if(  $childNode.getAttribute($newNodeAttribName) == $newNodeAttribValue ) {
				  //we found our new node.  Save and return it as an obj.	
				  			
				  return $childNode;		
			  }		
		  }	
	    }
	}
	
	
	
	//Create the days for the requested month (array of dates).
	// node parent obj, newNodeName, new node attrib name (will be 'month'), new node attrib value (e.g., 5 for may).
	public  function createDates($parentNode, $newNodeName, $newNodeAttribName='ordinal', $newNodeAttribValue){ 
	    $this->targetMonth = (integer)$newNodeAttribValue; //the month to create node for with all dates
	   // $targetYear = (int)$parentNode->getAttribute('ordinal'); //the parent year to create month node in.
	   $this->targetYear = (integer)date('Y');
	    //echo "month is " .$targetMonth . " and year is " . $targetYear;
	    //number of days in a month:
		// php function cal_days_in_month.  Returns the number of days in a month for a given year and calendar
	    //params: type of calendar, month, year)
	    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $this->targetMonth, $this->targetYear);
	    echo "There are ".$daysInMonth." days in Month ".$this->targetMonth." for ".$this->targetYear;
		
		// no matching mo. Create xml Calendar with ordinal year matching the import's yr This xmlYearNode is: 2017
		//There are 30 days in Month 4 for 2017
		// Then we get this error (on the 2nd time through?  I.e, May?):
		//Notice: Undefined variable: targetMonth in C:\inetpub\wwwroot\customsigncenter.com\calendar\csvimport.php on line 793
		// and
		//Notice: Undefined variable: targetYear in C:\inetpub\wwwroot\customsigncenter.com\calendar\csvimport.php on line 793

		//Fatal error: Uncaught exception 'Exception' with message 'DateTime::__construct(): Failed to parse time string (/1/) at //position 0 (/): Unexpected character' in C:\inetpub\wwwroot\customsigncenter.com\calendar\csvimport.php:793
		
	    $dates = array();
		    // for each day in the month, date('t') is number of days in the given month.
		   // for($i = 1; $i <=  cal_days_in_month(CAL_GREGORIAN,10,2005); $i++)
		
		
		/** On dev.customsigncenter.com getting error:
			** Undefined variable: targetMonth, csvimport.php on line 781, AND
			** Undefined variable: targetYear, csvimport.php on line 781 **/
		
		
		   for($i = 1; $i <= (integer)date('t'); $i++)
		    {	
			 $index = $i-1;	
			 $theDate = $i;
			 //need to know ordinal day of the week for the very first date
			 if($i===1){			  
				 $FirstOridinalDayofMonth = new DateTime((string)"$targetMonth/1/$targetYear", new DateTimeZone("America/New_York"));
				 $dayOfWeek = $FirstOridinalDayofMonth->format('N'); //0 is sunday, 1 mon, etc.
				 // echo "Day of the week for the first day of the month is: ".$day;
				 $dates['ordinalFirstDay'] = (integer)$dayOfWeek;
			 }
				    
			 //$theDates = $targetMonth.'-'.$i.'-'.$targetYear;
					 
			 $dates[$index]['month'] = (int)$this->targetMonth;
			 $dates[$index]['date'] = (int)$theDate;//creates a new index [0], [1] etc for each date.		  
			 $dates[$index]['year'] = $this->targetYear;
			 $nmbrOfDays = $theDate;//how many days in the month.		  	  
		    }	
		    
		    $dates['numberDaysinMonth'] = (int)$nmbrOfDays;
		    $datesArray = array();
		    $datesArray = $dates;		
		    //var_dump($dates);
		    //echo "first day of the month is: " .  date("$targetYear-$targetMonth-01"); // first day of this month
		    
		    $this->buildMonth($parentNode, $newNodeAttribName, $newNodeAttribValue); //works with the dates array property and xml objects;
		    
    /*returns this structure:	
		    
		    array(33) { ["ordinalFirstDay"]=> int(1) [0]=> array(3) { ["month"]=> int(8) ["date"]=> int(1) ["year"]=> string(4) "2016" } [1]=> array(3) { ["month"]=> int(8) ["date"]=> int(2) ["year"]=> string(4) "2016" } [2]=> array(3) { ["month"]=> int(8) ["date"]=> int(3) ["year"]=> string(4) "2016" } [3]=> array(3) { ["month"]=> int(8) ["date"]=> int(4) ["year"]=> string(4) "2016" } [4]=> array(3) { ["month"]=> int(8) ["date"]=> int(5) ["year"]=> string(4) "2016" } [5]=> array(3) { ["month"]=> int(8) ["date"]=> int(6) ["year"]=> string(4) "2016" } [6]=> array(3) { ["month"]=> int(8) ["date"]=> int(7) ["year"]=> string(4) "2016" } [7]=> array(3) { ["month"]=> int(8) ["date"]=> int(8) ["year"]=> string(4) "2016" } [8]=> array(3) { ["month"]=> int(8) ["date"]=> int(9) ["year"]=> string(4) "2016" } [9]=> array(3) { ["month"]=> int(8) ["date"]=> int(10) ["year"]=> string(4) "2016" } [10]=> array(3) { ["month"]=> int(8) ["date"]=> int(11) ["year"]=> string(4) "2016" } [11]=> array(3) { ["month"]=> int(8) ["date"]=> int(12) ["year"]=> string(4) "2016" } [12]=> array(3) { ["month"]=> int(8) ["date"]=> int(13) ["year"]=> string(4) "2016" } [13]=> array(3) { ["month"]=> int(8) ["date"]=> int(14) ["year"]=> string(4) "2016" } [14]=> array(3) { ["month"]=> int(8) ["date"]=> int(15) ["year"]=> string(4) "2016" } [15]=> array(3) { ["month"]=> int(8) ["date"]=> int(16) ["year"]=> string(4) "2016" } [16]=> array(3) { ["month"]=> int(8) ["date"]=> int(17) ["year"]=> string(4) "2016" } [17]=> array(3) { ["month"]=> int(8) ["date"]=> int(18) ["year"]=> string(4) "2016" } [18]=> array(3) { ["month"]=> int(8) ["date"]=> int(19) ["year"]=> string(4) "2016" } [19]=> array(3) { ["month"]=> int(8) ["date"]=> int(20) ["year"]=> string(4) "2016" } [20]=> array(3) { ["month"]=> int(8) ["date"]=> int(21) ["year"]=> string(4) "2016" } [21]=> array(3) { ["month"]=> int(8) ["date"]=> int(22) ["year"]=> string(4) "2016" } [22]=> array(3) { ["month"]=> int(8) ["date"]=> int(23) ["year"]=> string(4) "2016" } [23]=> array(3) { ["month"]=> int(8) ["date"]=> int(24) ["year"]=> string(4) "2016" } [24]=> array(3) { ["month"]=> int(8) ["date"]=> int(25) ["year"]=> string(4) "2016" } [25]=> array(3) { ["month"]=> int(8) ["date"]=> int(26) ["year"]=> string(4) "2016" } [26]=> array(3) { ["month"]=> int(8) ["date"]=> int(27) ["year"]=> string(4) "2016" } [27]=> array(3) { ["month"]=> int(8) ["date"]=> int(28) ["year"]=> string(4) "2016" } [28]=> array(3) { ["month"]=> int(8) ["date"]=> int(29) ["year"]=> string(4) "2016" } [29]=> array(3) { ["month"]=> int(8) ["date"]=> int(30) ["year"]=> string(4) "2016" } [30]=> array(3) { ["month"]=> int(8) ["date"]=> int(31) ["year"]=> string(4) "2016" } ["numberDaysinMonth"]=> int(31) }
		    
		    */
		    
		    
		    
		    
		
	
	
			
			
	}
	
	function buildMonth($parentNode, $newNodeAttribName, $newNodeAttribValue){
		
		
	}
	
	//iterates over dates of validated current month node contained in global $this->xmlMonthNode
	//to locate date of month matching the current csvRow['date'] as param $csvDate; 
	//for write to xml operation.
	function getXmlDate($csvDate){
		
		echo "  getXmlDate called!  <br/>";
		$this->xmlDayNode = '';//start fresh.
		
		
		for($iWk=0; $wk=$this->xmlMonthNode->getElementsByTagName('week')->item($iWk); $iWk++) {
		
		 //***DATE NODE******** Get the XML date node for this CSV row.  
		 
		  for($iDay = 0; $d = $wk->getElementsByTagName('day')->item($iDay); $iDay++) {
			  if( (integer)$d->getAttribute('date') == (integer)$csvDate ){	
				  
				  
				  $this->xmlDayNode = $d;	//We have the Day Node for this Row.
				 /* if(is_object($d)){
					  echo '$d is an obj <br/>';
				  } else {
					  echo '$d is NOT an obj <br/>';
				  }*/
				   /********* FIRST ******************/
				  /*  LET'S TRY TO REMOVE ALL CSV UPDATES THAT ALREADY HAVE A RECORD IN THE CURRENT XML DOCUMENT


				 //B4 appending new content to the old contents in the cal,
				 //we need to ensure that all new jobs are unique, and not already 
				 //saved someplace in the old calendar content.
				 //Use the span id (i.e., <span id="job_uniqueJobNumber">uniqueJobNumber</span> ) from 
				 //the old content, iterate over all of them, and then SKIP the new content update
				 //for any match betw/ new content's job number and any job number from the old content.

				 */
				  echo '<br>date node found.<br>';
				  
				  return $d;


			  } 
		    }//end for	
		}	
		
	}//getXmlDate
	
	private function exhaustiveSearch($csvNumber)
	{		
		$matchedNodes = array();
		
		// $mNodes = $this->xmlYearNode->getElementsByTagName('month');
		$jNodes = $this->xpd->query('//year/month/week/day/job');
		
		
		foreach($jNodes as $j){
			//echo '<br>Day node.<br>'; displays output for every day in the whole calendar.

			if( strcmp((string)$csvNumber,(string)$j->getAttribute('number')) === 0 )
			{								
				echo '<br>Duplicate Found.<br>';
				if( preg_match( '~unassigned~', $j->nodeValue ) ){

					//delete it if it is unassigned.
					echo "Adding unassigned job to array for deletion.";
					array_push($matchedNodes, $j);								

				} else {
					$matchedNodes['assigned'] = 1;
					//it is assigned.  set this node into the array of valid duplicates
				}
			}
			
		}	
		
		return $matchedNodes;		
	}
		
	
	function errorMsg(){	
		$this->msg .= "\r\n \r\n -- WRITING TO FILE -------------------------------------- \r\n";	
		$h = fopen('logs/calendar_log.txt', 'a'); //append to file
		fwrite($h, $this->msg);			
	}//endMsg()
	
}//class
