<?php    			
header("Expires: Sat, 1 Jan 2005 00:00:00 GMT");
header("Last-Modified: ".gmdate( "D, d M Y H:i:s")."GMT");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
/* /calendar/dev/index.php */
//error_reporting(E_ALL);
require_once('classes/security.php');
require_once('classes/active_token.php');
$ua = new userAuthenticate; //session start should be called by its parent, Session.
if(!isset($_SESSION)){	
	$s = new Session;
	//echo 'Developer Notification: A new Session created and session.php loaded.';
}
//var_dump($_SESSION['user']);
if( $ua->tokenSet( (integer)$_SESSION['user']['userId'], (integer)$_SESSION['user']['company'] ) === false ){	
	header('Location: login.php');
	//echo "userId is " . $_SESSION['user']['userId'] . " and company id is " . $_SESSION['user']['company'];
	//outputs: userId is 1 and company id is 10	
}
//get array of all logged in users:
//returns empty array, or users with assoc indices of 'username','email',
$loggedUserList = $ua->getLoggedUsersList($_SESSION['user']['userId']);
$loggedUsers = "<button type=\"button\" id=\"tglUserList\">Active Logins</button><p id=\"authenticatedUserList\" style=\"display:none\">";
if(!empty( $loggedUserList ))
{
	$loggedUsers .= "<span style=\"font-weight:bold\">Username, Email, Role</span><br/>";	
	foreach($loggedUserList[0] as $lu){
		$loggedUsers .= $lu['username'] . ", " . $lu['email']. ", ". $lu['role']."<br/>";
	}	
}
else
{
	$loggedUsers = "No Logged In Users.";
}
$loggedUsers .= "</p>";
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
				header('Location: login.php');
			}

			//echo $sesID;	TESTED: This new session start id does match the one in the uri from prior page.
			//and matches the one in the database for the active session.
			//if(!empty($query['sid'])) { $sesURI .= $query['sid'];}else{ $sesURI = '';};	
	 }
} else {

	if($_SESSION['user']['role'] === 'Developer' || $_SESSION['user']['role'] === 'admin'){
		$role = 'admin';
		$modalAdminTools = '<img onclick="rearrangeJobs(this)" src="assets/dragicon.png" title="drag" class="dragImg" /> &nbsp; <span class="addNewLine" onclick="addNewLine(this, modal)"> + </span>';		
	} elseif($_SESSION['user']['role'] === 'mgr'){
		$role = 'mgr';
	}

	$roleBasedJsFile = ( $role === 'admin' ? 'admin2.js?ver=4' : 'mgr.js?ver=1');
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
	/*	
		
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
*/

	
	//session_start();
  	//$_SESSION['counter']++;
  	//echo "You have visited this page $_SESSION[counter] times.";
	

/*  LOAD NEW CSS FILE IF MODIFIED DATE CHANGED  */

/**
 *  Given a file, i.e. /css/base.css, replaces it with a string containing the
 *  file's mtime, i.e. /css/base.1221534296.css.
 *  
 *  @param $file  The file to be loaded.  Must be an absolute path (i.e.
 *                starting with slash).
 */
/******* REQUIRES HTACCESS RULES ************************************************/
	/*
RewriteEngine on
RewriteRule ^(.*)\.[\d]{10}\.(css|js)$ $1.$2 [L]
	*/
function auto_version($file)
{
  if(strpos($file, '/') !== 0 || !file_exists($_SERVER['DOCUMENT_ROOT'] . $file))
    return $file;

  $mtime = filemtime($_SERVER['DOCUMENT_ROOT'] . $file);
  return preg_replace('{\\.([^./]+)$}', ".$mtime.\$1", $file);
}
/* USE: <link rel="stylesheet" href="<?php echo auto_version('/css/base.css'); ?>" type="text/css" />*/


?>

<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title></title>   	

	
   <!-- styles -->   
   <link rel="stylesheet" href="styles/bootstrap.min.css" type="text/css" media="all" />
   
	<!-- styles - Load Fresh Each Time -->  
   <link rel="stylesheet" href="<?php echo auto_version('styles/calendar.css'); ?>" type="text/css" media="screen" />	
   <link rel="stylesheet" href="<?php echo auto_version('styles/print_1.css'); ?>" type="text/css" media="print" />
   
  <!-- <link href="styles/print.css" rel="stylesheet" media="print"> -->
   <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css" media="screen">
   <link rel="stylesheet" href="assets/pickadate.js-3.5.6/default.css" media="screen">
   <link rel="stylesheet" href="assets/pickadate.js-3.5.6/default.date.css" media="screen">
   <link href='https://fonts.googleapis.com/css?family=Kaushan+Script&effect=3d-float' rel='stylesheet' type='text/css'>   
   <link rel="stylesheet" href="<?php echo auto_version('assets/icomoon/style.css'); ?>" type="text/css" media="all">
    <link rel="stylesheet" href="styles/nav.css" media="screen">
	<link rel="stylesheet" href="styles/draggable.css" media="screen">
 <script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js" crossorigin="anonymous"></script>
	<!-- for draggable functionality, touch-punch must be loaded after jquery and jquery-ui -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
    <!-- load appropriate js based on authenticated user's role. -->
<script src="assets/<?php echo $roleBasedJsFile ?>" type="text/javascript" charset="utf-8"></script>
</head>
<body>
<div class="container-fluid" style="padding:15px;">
<pre style="text-align:center"><span style="font-size: 12px; background:#FEFFF3;padding:5px 8px;color:#419200; border: 1px dotted #8AC72D">Today: <span id="date"></span> [ <span id="curTime"></span> ]</span> <br>
<span><a href="contact.php" target="_blank" title="Opens Email Form in a New Window or Tab">REPORT BUGS</a> | <a href="help.html" target="_blank" title="WIP Support">HELP</a> | <a href="directory.php" target="_parent" title="Employee Phone Directory">EMPLOYEE DIRECTORY</a></span><br><br><span  style="text-align:center; margin: 8px auto 2px auto">Recommended Browsers (Avoid IE; MS Edge is OK)</span><br><img src="assets/compatible_browsers.png" title="Compatible Browsers for This Calendar App" style="text-align:center; margin: 0px auto 5px auto" />
</pre>

<h1 id="pageTitle" class="cursive font-effect-3d-float" style="margin: 6px auto;text-align:center;color:#000"></h1>
	<!--<h3 style="margin: 14px auto;text-align:center;color:#4642A8;background:#DDE95B;padding:18px; text-align:center;font-family: 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', 'DejaVu Sans', Verdana, 'sans-serif'">
		APP DEVELOPMENT PLAYGROUND: This calendar is NOT SHARING nor SAVING Job Data with the Live Calendar.
		
	</h3>-->
	
<br />


<br />

<div class="row">
	<div class="col-lg-3 col-md-offset-1">
	<h3 style="margin: 2px auto 5px auto;color:#8AC72D" class="cursive">Choose a Company Calendar</h3>
	<form action="" method="post" name="loadCalendar" id="loadCalendarForm">
		<select name="companyCalendar" id="companyCalendar" >
			<?php if($curCo==='All') : ?>
					<option class="csc" value="Custom Sign Center" selected>Custom Sign Center</option>
					<option class="jg" value="JG Signs">JG Signs</option>
					<option class="marion" value="Marion Signs">Marion Signs</option>          
					<option class="boyer" value="Boyer Signs">Boyer Signs</option>
					<option class="outdoor" value="Outdoor Images">Outdoor Images</option>		    
			<?php elseif($curCo==='Custom Sign Center') : ?>    
				<option class="csc" value="Custom Sign Center" selected>Custom Sign Center</option>    
			<?php elseif($curCo==='Boyer Signs') : ?>
				 <option class="boyer" value="Boyer Signs">Boyer Signs</option>
			<?php elseif($curCo==='Marion Signs') : ?>    
				<option class="marion" value="Marion Signs">Marion Signs</option>          
			<?php elseif($curCo==='Outdoor Images') : ?>        
				<option class="outdoor" value="Outdoor Images">Outdoor Images</option>   
			<?php elseif($curCo==='JG Signs') : ?>
				<option class="jg" value="JG Signs">JG Signs</option>
			<?php endif; ?>  
		  </select>      
		  <button class="smBtn" name="submitBtn" style="margin-left: 15px">Submit</button>
	 </form>
	 </div><!--/col-lg-4, select-company-form wrapper-->
	 
	 <div class="col-lg-3 col-md-offset-1">
		 <form class="form-group"><label>SEARCH (Job Number or ANY text)</label>
			<input type="text" id="search" class="form-control" placeholder="Search and Click" style="background-color: lightyellow;">
			<div id="srchResult" class="hide" style="background-color: #86C73A; color:#0B6F93; padding:10px 25px"></div>
		</form>	 
	</div><!--/col-lg-4, search jobs form-->	 
	 
	 <div class="col-lg-3 col-md-offset-1">
		
		<?php if($username) { 
			echo "<div style=\"margin: 2px auto 8px auto;;font-size:18px;color:#8AC72D\" class=\"cursive\">Welcome <span id=\"username\">". $username ." <span style='font-family:san-serif'>&nbsp;(".$role.").</span></span></div>
			<form action=\"login.php\" method=\"POST\" >
				<input type=\"hidden\" value=\"".$username."\" name=\"loggedOutUser\" />
				<input class=\"smBtn\" type=\"submit\" value=\"logout\" name=\"logout\" />
			</form>
			<br/>";
			/*if( !empty($userProfiles) ){
				echo $userProfiles;				
			}*/
			echo $loggedUsers;
			echo "
			<!-- Show this for admins?
			<form action=\"register.php?sid={$sesID}\" method=\"POST\" >
				<input type=\"hidden\" value=\"".$_SESSION['user']['role']."\" name=\"role\" />
				<input type=\"submit\" value=\"Register a User\" name=\"logout\" />
			</form>
			-->
			";
		} else {
			$username = 'user';
		} ?>
	 </div><!--/col-lg-3, Welcome user, logout form-->
 </div> <!--end row-->
 
 <div class="row">
      
        <!-- BACKUP
        
        <button class="morPad center btn backup" name="backup" onClick="toggleVisibility('#backup')">CREATE RESTORE POINT</button>
        <form id="backup" name="backup" class="hide">
		   <p>Backup File Name (leave as defined below, or enhance the name.)</p>
		   <label>File Name: 
			   <span>

			   <?php //$filename = date('Y-m-d', strtotime('now')) + '_' + $username;  echo $filename; ?>
			   
			   </span>
		   
		   </label> <input type="text" name="filenameSuffix" value="" />
		            <input type="hidden" name="filename" value="<?php // echo  $filename ?>" />
			       <input type="submit" value="Backup Now" onclick='backUpCal()'>
	  </form>
       -->
        <!-- lengend -->
        
        
		
			   <!-- column #1: listing of overdue jobs -->        
			   <!-- show here, if any, jobs marked as OVERDUE -->
		<div id="icons"> 
		<div class="col-lg-3 col-md-offset-1">
			<h3 style="display:inline-block;margin-right:20px">OverDue Jobs</h3><!--<button	class="smBtn" id="overdueReveal">Expand List</button>-->
			<div style="" id="OverDueJobsList">
			</div>		
		</div>   
			   
		
		<!-- column #2: The Job Assignment Checkbox Groups --> 
		
		<div class="col-lg-8"> 
	   
	    		<div class="container-fluid" id="checkboxWrapper">
	    		  <div name="teamdata" id="teamSelection"> <!--js id to show/hide ticked checkbox assignments-->
				<div class="row">		   
				    <div class="iconrow">      
					    <!--chkbx attrib is used to show / hide jobs having matched css class (i.e. t21) -->    	
						<input style="float:left" type="checkbox" id="select-21" name="t21" value="t21" checked="checked">               
						<div class="box-label due"> Overdue</div>
					</div>
				</div><!--/row-->
				
				<div id="teams">					  
		
						 
				</div><!--/.row /#teams-->
				</div>
			 </div><!--container-fluid for checkboxes-->
		 </div><!--/col-8 for job-assignment checkboxes-->
		
		</div><!--/#icons styling-->
	</div><!--/row, overdue jobs and job assignment selector columns-->
          <br/>
          <div class="row">
           	<div class="col-md-10">
           	<div class="pull-right">
			  <button class="morPad center btn save" name="update" onClick="saveMonth()">SAVE UPDATES</button> &nbsp;
			  <!-- <button class="morPad center btn undo" name="undo" onClick="editHistory('undo')">UNDO</button>
			   <button class="morPad center btn undoall" name="undoall" onClick="editHistory('undoall')">UNDO ALL</button>
			   <button class="morPad center btn redo" name="redo" onClick="editHistory('redo')">REDO</button> -->  
			
		   	 
			  <?php if($role === 'admin') : ?>
				  <a style="float:left;margin-left:7px" href="csvimport.php" target="_blank">
				  <button class="morPad center btn import" name="import">IMPORT CSV</button></a> &nbsp;
			  <?php endif; ?>
				
				<button class="smBtn" onclick="clearCache()">Clear Cache</button> &nbsp;
			
          		<button class="smBtn" onclick="teamsShowAll()">Show All</button> &nbsp;
			
          		<button class="smBtn" onclick="teamsHideAll()">Hide All</button> &nbsp;	
         		
          		<button class="smBtn" id="btnPrint">Print</button> &nbsp;
          		
				<?php if($role==='admin') : ?>
					<button type="button" class="smBtn" id="btnEmail" title="Emails PDF Attachment.  
					See 'HELP', above, for best PDF formatting method.">Email</button> &nbsp;
				
					<button data-clipboard-target="div#prevEmailPopUp" data-clipboard-action="copy" class="copy smBtn" id="previewEmails" > Preview Recipients</button>
					<div id="prevEmailPopUp" class="hide" style="background:#3C8CB8; color:#ECC585; padding:12px; position:absolute; z-index:9999;left:400px">          
					</div>
				<?php endif; ?>
				</div><!--/bootstrap's pull-right-->
			</div><!--/col-md-9, button group-->
			<div class="col-md-2">&nbsp; <!-- right gutter space--></div>
			
  </div><!--/row, buttons-->



</div><!--/container-fluid, bootstrap4-->

<div class="content-row" id="message">
</div>

<div id="calWrap" class="clearfix">
	<div id="topHeaders">
        <!-- <div class="row">
               <div class="btnPrev"><a href="#" onClick="prev('yr')"><img  id="prevYear" src="assets/prev-yr.png"></a></div>       
             
               <div class="btnNext" ><a href="#" onClick="next('yr')"><img id="prevYear" src="assets/nex-yr.png"></a></div>     
          </div> -->
          <div class="calRow">
             <div id="btnPrev"><img  id="prevMonth" src="assets/prev-mo.png"></div>              
              <div style="width:49.5%; display:inline-block; text-align:center; margin: 0px; box-sizing:border-box;"><span class="cursive" id="mo" oridnal=""><!-- e.g., ordinal="12" for december --></span> <span class="year cursive" id="yr" ordinal=""><!-- e.g., 2016, etc --></span></div>
              <div id="btnNext" ><img id="nextMonth" src="assets/nex-mo.png"></div>             
          </div>
     </div><!--end topHeaders-->
         <div id="headerDays">
              <div class="calCol morPad bold weekend">SUN</div>          
              <div class="calCol morPad bold">MON</div>
              <div class="calCol morPad bold">TUE</div>
              <div class="calCol morPad bold">WED</div>          
              <div class="calCol morPad bold">THU</div>
              <div class="calCol morPad bold">FRI</div>
              <div class="calCol morPad bold weekend">SAT</div>
         </div>
         <div id="weeks">
           <!-- js builds the rows as month requires 
             <div class"calRow" id="row1">
             	<div class="date" ordinal=""></div>
               <br/>content is entered here
             </div>
             <div id="row1"></div>
             <div id="row1"></div>
             <div id="row1"></div>
             <div id="row1"></div> 
           -->
         </div>
         <div id="calFooter">App ver. <?php include(__DIR__.'/backup/ver.php') ?>. <br>2015 - <?php echo date('Y') ?> &copy; Custom Sign Center, Inc. -- All Rights Reserved.</div>     
	<div class="blocker hide">

     	<div id="modal" class="modal">
          <button class="smBtn" onclick="modalClose(this)">Close</button>
          <button class="smBtn" onclick="printAnyElement('modal')">Print</button>
			<span style="margin: 3px 12px">
				
				<!-- if the user is an, they can rearrange the jobs in the cell -->
				<?= $modalAdminTools ?>			
				 
			</span>          
          </div>     
	</div>
	<div id="printSection"><!--loads with printable domClone --></div>
    <img class="hide" id="wait" src="assets/preloader_blue.png" />
</div>
<!--scripts-->

<script  src="assets/pickadate.js-3.5.6/picker.js" type="text/javascript" charset="utf-8"></script>
<script src="assets/pickadate.js-3.5.6/picker.date.js" type="text/javascript" charset="utf-8"></script>
<script src="assets/clipboard.min.js" type="text/javascript" charset="utf-8"></script>
<!--<script src="assets/pickadate.js-3.5.6/legacy.js" type="text/javascript" charset="utf-8"></script>-->
  <!-- shared js functions -->

<script>
	var role; //  e.g., admin, mgr
	var curCompany; 
	(function(){
		/* global scope vars */
		var ses = '<?php   echo json_encode($ses); ?>';
		console.log(ses);
		role = '<?= $role; ?>'; //  e.g., admin, mgr
		console.log(role);
		curCompany = <?php  $c = ( $curCo == 'All' ?  'Custom Sign Center' :  $curCo ); echo "'".$c."'" ?>;
	})();	
	
	var coID = <?= $_SESSION['user']['company']; ?>;
	var userID = <?= $_SESSION['user']['userId']; ?>;
	
</script>
<script src="<?php echo auto_version('assets/common.js'); ?>" type="text/javascript" charset="utf-8"></script>	
	<script src="assets/draggable.js" type="text/javascript" charset="utf-8"></script>	



<div id="copyemails" style="height:0px;width:0px;margin:0px;overflow:hidden;">'alicia@customsigncenter.com','christina@customsigncenter.com','courtney@customsigncenter.com','dale@customsigncenter.com','dan@customsigncenter.com','debbie@customsigncenter.com','don@customsigncenter.com','doug@customsigncenter.com','emylee@customsigncenter.com','eric@customsigncenter.com','james@customsigncenter.com','jeff@customsigncenter.com','john@customsigncenter.com','jreed@customsigncenter.com','judy@customsigncenter.com','justin@customsigncenter.com','marcus@customsigncenter.com','mary@customsigncenter.com','michael@customsigncenter.com','nathan@customsigncenter.com','sam@customsigncenter.com','scott@customsigncenter.com','tturner@customsigncenter.com','teryl@customsigncenter.com','timh@customsigncenter.com','tim@customsigncenter.com'</div>
<div id="print" class="hide" style="font-size:15px"></div>
<!-- copy text of an element to clipboard... REQUIRES : No Libraries -->
<!--<script src="assets/clipboard.min.js" type="text/javascript" ></script>-->

<div style="visibility:hidden;padding:0;margin:0;height:0" id="hiddenClipboard"></div>

<div class="hide" id="overlay">	
	<div id="modalForm" style="text-align:center">
		<button class="smBtn" onclick="formModalClose()">Close and Cancel</button><br>
		<p>All Fields Are Optional.  Your Input Will Be Appended to The Default Message.</p>
		<label>Sender's Email Address</label><br><input name="fromEmail" type="email" /><br><br><br>
		<label>Comments</label><br><textarea name="message" type="email" ></textarea><br><br>	
		<button class="smBtn" onclick="userEmailInput()">Send Email</button>
	</div>	
</div>

</body>


</html>
