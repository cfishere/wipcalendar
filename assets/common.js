/* ver 1.5 
*  Chris Nichols. chris@customsigncenter.com *
*/	
	var weeksDOM = document.querySelectorAll("div#weeks");
	var headerYr = document.getElementById("#headerYr");
	var timeoutID;
	var originalContent='';
	var content;
	var newContent = '';
	var curMonthCounter; //prev/next calendar month counting : increment/decrement
	var lastEditedCell=[];
	var redo=[];	
	var redoObj;
	var year;
	var month; //integer
	var theDate;
	var editableLI; //the active/current right-clicked LI obj that contextmenu will style.
	var todayOrdinalCell; //integer of the cell count for today's date.
	var changes=[];
	var responseMonth; //the most recent month html / data sent by php
	
	var listElements = []; //all the list elements that hold job entries
	var boxIDs = ['t0','t1','t2','t3','t4','t5','t6','t7','t8','t9','t10'];
	var modalSource;
	var modalContent;
	var monthName = ["OccupyZeroPosition-PlaceHolder","January","February","March","April","May","June","July","August","September","October","November","December"];
	var dateParts;
	var $icon = '<i class="p1"></i><i class="p2"></i><i class="p3"></i><i class="p4"></i>';
	var teamHTML='';
	var $usr;
	// for rollback purposes; data reporting to user view.
	var historicUpdates = {};
	// holds all user changes in an object; applied to remote xml if a save operation is called.
	var pendingUpdates = {};
	var teamAssignment = [];
	var assignLabels = [];
	var iconSet = {
	'ups':'ic-ups',	
	'unassigned':'ic-flag',
	'trip':'ic-i-ret-trip',	
	'crane':'ic-i-crane',	
	'crew':'ic-users',
	'parts':'ic-cog',
	'comp':'ic-i-comp-alt',
	'inv':'ic-i-comp-inv',
	'info':'ic-p-inf',
	'inspr':'ic-p-insp-req',
	'inspa':'ic-p-insp-appr',
	'pappr':'ic-p-appr',
	'prmt':'ic-asterisk'
	};

    // obj for one-place-editing of icon assignments
	// construct the iconographic legends map and user action menus:	
	var iconAssignments = {
			//property names serve as CSS class names, AND as the 1st param
			//sent by onclicks to jobAssignment(), to identify which was clicked.
			"Custom Sign Center" : {
				//max of 9, else the view drops to new line.		
				//CSS class:label
				"1":"RobertC", 	//red, e.g. class 't1'
				"2":"Ali", 		//violet (class t2)
				"3":"Mary", 		//green
				"4":"Teryl",	//yellow #CCCC1F
				"5":"Scott", 	//black
				"6":"SubInstall", 	//Orange
				"7":"CSC Transp", 	//lightBlue
				"8":"Shipping", 	//blue
				"9":"Cust PU", 	//pink
				"10":"UPS/ic-ups", 		//brown .ic-ups; option 10
				"11":"UnAssigned/ic-flag" 	//Black, red flag, yel bg.  .ic-flag
			},		
			"Outdoor Images":{
				"1":"Chad", 	//red, e.g. class 't1'
				"2":"Marvin", 		//violet (class t2)
				"3":"Shawn", 		//green
				"4":null,
				"5":"Pat", 	//black
				"6":null, 	//Orange
				"7":"Rec CSC Transp", 	//lightBlue
				"8":"Rec Shipping", 	//blue
				"9":"Cust PU", 	//pink
				"10":"UPS/ic-ups", 		//brown .ic-ups; option 10
				"11":"UnAssigned/ic-flag" 	//Black, red flag, yel bg.  .ic-flag
			},
			"Marion Signs":{},
			"Boyer Signs":{},
			"JG Signs":{},		
		
	};
 	// str to build HTML of team icon checkboxes
	var teamIconsDisplay='';

	var justReloaded = 0;
	//add/remove jobs that are marked 'overdue' so they can be output to the view in designated areas.
	var overdueJobs = {};
	
	//2 idle user globals
	var IDLE_TIMEOUT = 900; //15 mins
     var _idleSecondsCounter = 0;  
	
	
	//url parameters
		//user's company access rights.  "developer" has no admin user session token or company restrictions.
	var userCompany;

	
	
function BrowserDetection() {
    //Check if browser is IE
    if (navigator.userAgent.indexOf('MSIE') > -1) {
        // insert conditional IE code here
		alert("Internet Explorer is NOT recommended for the Calendar. Install and Use FireFox or Chrome Instead.");
    }/*
    //Check if browser is Chrome
    else if (navigator.userAgent.search("Chrome") & gt; = 0) {
        // insert conditional Chrome code here
    }
    //Check if browser is Firefox 
    else if (navigator.userAgent.search("Firefox") & gt; = 0) {
        // insert conditional Firefox Code here
    }
    //Check if browser is Safari
    else if (navigator.userAgent.search("Safari") & gt; = 0 & amp; & amp; navigator.userAgent.search("Chrome") & lt; 0) {
        // insert conditional Safari code here
    }
    //Check if browser is Opera
    else if (navigator.userAgent.search("Opera") & gt; = 0) {
        // insert conditional Opera code here
    }*/
}

function clearAlert() {
  window.clearTimeout(timeoutID);
}

$(document).ready(function (){	 
	$usr = $("#username").text();	
	console.log('$user is: '+$usr);
     
	
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
	 if (minutes.length < 2){
		 minutes = "0"+minutes;
	 }
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


	var weekRows = $( "#weeks .calRow" ); //each row
	//dispay the cal from xml when page first loads
	

	 document.onkeypress = function() 
	 {
	    _idleSecondsCounter = 0;
	 };
	 document.onclick = function() 
	 {
	    _idleSecondsCounter = 0;
	 };
	 document.onmousemove = function()
	 {
	    _idleSecondsCounter = 0;
	 };

	 window.setInterval(CheckIdleTime, 2000); //checks every 2 seconds
	
	$('#companyCalendar').on('change', function() {
  		changeCompanyCalendar();
	});	
	
	curCompany=$( "#companyCalendar option:selected" ).val();
	
	loadCalendar(curCompany,-1,-1);
	
	$("#pageTitle").html(curCompany + " WIP Calendar");
	
	
	
	$("#btnPrev").on('click', function(){		
		displayNewMonth('prev');		
	});	
	
	$("#btnNext").on('click', function(){	
		displayNewMonth('next');		
	});

	 //printing calendar
  $("#btnPrint").on("click", function () { 
 		cleanCalendarLayout();
		printWindow();          
   });
  
	//toggle show/hide user list.
	$( "button#tglUserList" ).click(function() 
	{
  		$( "#authenticatedUserList" ).slideToggle( "slow" );
	});  
  

  /*
 	// slide open or close the select list form to choose company directories:
	// callback toggleText will update the instructional text with 'Show ' or 'Hide '
	$("#overdueReveal").click(function(){
    	if( $("#OverDueJobsList").css("height") === '50px')
			{
				$("#OverDueJobsList").css("height", "auto");				
				
			}	else {				
				$("#OverDueJobsList").css("height", "50px");
				
			}		
		toggleText();
	});
   
	*/   
   
   justReloaded = 1;  
   timeoutID = window.setTimeout(addListenersToDom, 1100);
	
}); 

/*  END DOC READY ***********************************************************************/


//callers set status to 'start' or 'end';
function wait(status){
	if(status=='start') 
	{ 
		$( "#wait" ).removeClass( "hide" );
		setTimeout(function(){  }, 500);
	}
	else 
	{ 
		$( "#wait" ).addClass( "hide" ); 
	}
}

function addListenersToDom(showTeamsBool)
{
	console.log('common.js calls addListenersToDom for show/hide teams');
	 //set teamnames into the icon checkboxes HTML for curCompany;
    renewTeamIconCheckboxDispaly();

    // ability to edit jobs and add notes belongs to Admins only:
   
	    var editboxes = document.getElementsByClassName('edit');	 
		// alert("editboxes is: " + editboxes);
		 
		 $.each(editboxes, function(i, elem){		 
			
			 //var dateBox = editboxes[i].parentNode; //parent of the edit box.
			//evt.stopImmediatePropagation();stopPropagation()
			// if(  )
   			if( typeof isAdmin !== 'undefined' )
			{
				editboxes[i].addEventListener('dblclick', startEdit, true);
				bindListeners4EachList(elem);
			}
			listsIntoObjects(elem,i);
		 });	 
		
	 // add listeners to the checkboxes to select the team entries to show or hide
	 // array of inputs - "toggle show / hide" input checkboxes array
	 var checkboxes = $('#checkboxWrapper').find('input');	 
	 
	 $(checkboxes).each(function(i,box){
		 //change listener for each checkbox
		 $(box).on("change", function() {
			 //alert('Checkbox status changed!');
			 //which box changed? Answ = this
			 //which box changed? Answ = this
			 var chkBoxName = $(this).attr('name');
			 var chkBoxId = $(this).attr('id');
			 var ptrn =new RegExp(/^(?:ic-).*$/); //for finding prefix 'ic-' for icon-related chkbxes
			// alert('the checkbox id is ' + chkBoxId);
			 
			 if( $(this).is(':checked') ) {	
			 	// we need to show these if they are hidden				
				// find each li in the DOM with a class matching the checkbox's chkBoxName.
			
				//First: does the checkbox name attr begin with 'ic-'? (ic-cog, etc.)			
				if( ptrn.test(chkBoxName) === true )
				{
					//this is an icon job.
					hideShowIconJob(chkBoxName,true);
				} 
				else 
				{
					console.log("This is a show/hide for a team, not and icon status");
					//hideShowTeamJob
					for( var i = 0; listElements.length > i; i++ ) 
					{	
						if($(listElements[i]).hasClass(chkBoxName))				  		
						{
							$(listElements[i]).removeClass("hide");
						} 
					 }//end for
			   }//else (team job)
			 }
			 else //change is an uncheck (so hide it)
			 {
				 //First: does the checkbox name attr begin with 'ic-'? (ic-cog, etc.)			
				if( ptrn.test(chkBoxName) === true )
				{
					//this is an icon job.
					hideShowIconJob(chkBoxName,false);
				} 
				else 
				{
					for( var ndx = 0; listElements.length > ndx; ndx++ ) 
					{	
						if($(listElements[ndx]).hasClass(chkBoxName))				  		
						{
							$(listElements[ndx]).addClass("hide");
						}		
					}
				}
			 }
		 });		 
	 });
	 
	 //remove hide class from any hidden LI elements with a new loading of the page.
	 if(justReloaded === 1)
	 {	//reset the toggling variable to false
		
		 
		  //this func needs a delay so calling here, not in the doc ready.
		 onloadSetOverdueDisplay();	
		 justReloaded = 1;
	 }
	 
	   //hide the first and last div in each .row (sundays and saturday columns)
/*    var eachMonth =  $("#weeks").find(".month");
    $(eachMonth).each(function(i,el)
    {	 
	   var $monthRow = $(el).find(".row");	   
	   $($monthRow).each(function(i2, row){
		   var div1 = $(row).children("div:eq( 0 )");
		   var div2 = $(row).children("div:eq( 6 )");
		  //DON'T HIDE WEEKENDS ANYMORE
		   //$(div1).addClass("hide");
		  // $(div2).addClass("hide");
	   });	  
    });	*/
    //remove hide class
    if(showTeamsBool === "true"){
    	    teamsShowAll(); 	    
    }
}

// assign each lineEntry LI to the global listElements Obj
function listsIntoObjects(eachUL,i){ 
	//convenience global obj to hold all job entry LI's on the page; used for show specific jobs by team
    var liObj = $(eachUL).find("li");	
    $(liObj).each(function(ct, liItem) {
	    listElements.push(liItem);
	    //console.log('list number' +ct+ ' found for UL number '+ i);
    });
    
   
	
}
	
	
//idle user function:
function CheckIdleTime() {
    _idleSecondsCounter++;
    var oPanel = document.getElementById("SecondsUntilExpire");
    if (oPanel)
        oPanel.innerHTML = (IDLE_TIMEOUT - _idleSecondsCounter) + "";
    if (_idleSecondsCounter >= IDLE_TIMEOUT) {
        var answer = confirm("You've been idle 15 mins.\nPlease click OK to continue session.\nTo close this session click Cancel.");
        if (answer) 
        {
            //document.location.href = "login.php";   
            _idleSecondsCounter=0;
        }
        else{
            //window.open('', '_self', ''); window.close();
            document.location.href = "login.php";
        }

    }
 }


function loadCalendar(co, m, y){
	//console.log('load calendar func called. CurCompany is: '+ co['companyCalendar']);
	//reset the overdue jobs obj to empty.
	overdueJobs = {};
	$("#OverDueJobsList").html('');
	if(typeof co === 'undefined') { co = curCompany;}
	wait('start');
	var today = new Date(); //date obj
	var cDate = today.getDate(); //current date.
	
	//if month and yr not passed in...
	if(m<0){//set month to cur month		
		m = today.getMonth()+1; //month is zero-based (+1)
	}
	if(y<0){//set year to cur year .. by default, load cur yr on first load.			
		y = today.getFullYear();		
	}
	
	
	//date = current date to highlight, month=req mo, year=req yr.
	var data = {"content":'',"year":y,"month":m,"theDate":cDate,"company":co,"method":"display"}; 
	
	$.ajax({	
		  url : "classes/calendar.php",
		  type: "POST",
		  data : data,
		  dataType:"json",
	   success: function(respData, textStatus, jqXHR)
	   {
		   wait('end');
		 //debug:
		 /* console.log('respData was: ' + respData);*/
		  theDate = respData.theDate;
		  year = respData.year;
		  month = respData.activeMonthNumber;
		  curMonthCounter = month;
		  //monthName = respData.activeMonthName;	
		 
		  todayOrdinalCell = respData.activeOrdinalCell;
		 $("#weeks").html(respData.html);
		 //for "undo all" operations, preserve copy of html
		 var respDataHtml = toString(respData.html);
		 $("#yr").html(year);
		 $("#yr").attr('ordinal', year);
		 $("#mo").html(monthName[month]);		 
		 $("#mo").attr('ordinal', month);
		 //the company the user has access rights for:
		 // "developer" = no user session; user is within the /dev directory. No 'admin' login blocking applies.
		 userCompany = respData.userCompany;
		 //$(".month").attr('yr', year);	 
		 
	   },
	   error: function (jqXHR, textStatus, errorThrown)
	   {
		  wait('end');
	   }	
  	});
	timeoutID = window.setTimeout(addListenersToDom, 300);	
	justReloaded = 1;
}

function giveNotice(message){
	
	$( "div#message" ).fadeIn( 'slow', function(){
	    $( "div#message" ).css("display", "inherit");
	    $( "div#message" ).css("padding", "12px");
	    $( "div#message" ).css("height", "auto");
	    $( "div#message" ).html("<p>"+message+"</p>");
	}).delay( 1600 ).fadeOut('slow' );
	$( "div#message" ).css("display", "none");
	$( "div#message" ).css("padding", "0px");
	$( "div#message" ).css("height", "0px");
}

//form buttons' functions
function clearCache(){	
	caches.keys().then(cs=>cs.forEach(c=>caches.delete(c)));
}

function teamsShowAll(){
	
	//only show all if the modal popup is not visible.
	
	if( $('#modal').is(":visible") === false ){	
		
		//check boxes for our job status icon items need checks restored to checkboxes		
		var JobStatusInputsWithCheckboxes = $('.j').find('input');
		$(JobStatusInputsWithCheckboxes).each(function(){
			//uncheck ea box
			$(this).prop('checked', true);				
		});
		
		//show all team-assigned jobs
		$(listElements).each(function(i,entry)

		{   //console.log('showall teams fired for ' + $(entry).clone().html());
		//outputs <span id="job_98592">98592</span> WEN #05802 WO 98592 Parsippany, NJ
			$(entry).removeClass('hide');
		});

		var TeamChkBoxes = $("#teamSelection").find("input");
		$(TeamChkBoxes).each(function(x,box)
		{

				$(box).prop("checked", true);

		});
	} else {
		return false;
	}
}
	
function teamsHideAll(){
	//this.preventDefault();
	//alert('hide called');
	
	//hide every li item that contains an span->i-> with class begining with "ico-"	
	var JobStatusInputsWithCheckboxes = $('.j').find('input');
	$(JobStatusInputsWithCheckboxes).each(function(){
		//uncheck ea box
		$(this).prop('checked', false);
		var iconName = $(this).attr("name");		
		hideShowIconJob(iconName,false);		
	}); //done hiding all icon-assigned jobs
	
	//hide all team or ship assigned jobs:
	$(listElements).each(function(x,listItem)
	{  //console.log('Hide all fired');
		if( $(listItem).parent().hasClass('edit') ){			
			$(listItem).addClass('hide');
		}
	});	
	
	//alert ("teams hide all has been called");
	var TeamChkBoxes = $("#teamSelection").find("input");
	//var lengthOf = TeamChkBoxes; 
	//alert("length is " +lengthOf);
	$(TeamChkBoxes).each(function(d,cBox)
	{
		//if($(cBox).is("checked")){
			//alert("trying to uncheck a box");
			$(cBox).prop('checked', false);
		//}
	});
}

//the pencil icon button click = clickedObj
/**
 * Displays content in a modal window
 * @param node obj clickedObj, button
 * @param str displayType; a 'day' or a 'week' of days.
 * @return calls addListenersToDom to refresh listeners
 */
function modalOpen( clickedObj, displayType ) {

	// Common housekeeping to both display types:
	if( typeof dragEditing !== 'undefined' ){
		dragEditing = "OFF";		
	}
	//if search results open, hide them.
	hideSearchResult();		
	//if there is an opened contextMenu popup, remove it first.
	if(typeof isAdmin !== 'undefined')
	{
		if( $('#divContextMenu').is(":visible") )
		{
			$('#divContextMenu').remove();
			$(document).find('.context-style').removeClass('context-style');
		} 
	}

	var $m = $(clickedObj).closest(".month");

	/* 
	 * displayType = 
	 * case: 'day', clone HTML as an editable node (isAdmin Only).
	 * case: 'week', display week HTML, not editable, add a print button.
	 * */
	
	if( displayType === 'day' )
	{			
		//to prevent duplication to same date of different months 
		//after closing the modal, must know NOT ONLY the modalId 
		//of the date cell but also the month and year of the cell.		
		
		modalContent = $(clickedObj).parents('.date').children('ul');	
		var numerMonth = $($m).attr("ordinal");
		//console.log("Ordinal as a month is "+ numerMonth);
		var numerYr = $($m).attr("yr");
		$(modalContent).attr('ordinal',numerMonth);
		$(modalContent).attr('yr',numerYr);
		
		var numerDate = $(modalContent).attr('modalid').replace('d','');
		//will result in, ex: <ul modalid="d3" ordinal="5" yr="2017">
		//in the modal div, for a date of May 3rd, 2017 from the calendar.
			
		//display the date in the modal popup.
		var cellDate = '<span class="cursive" style="float:right;font-size:17px;color:#8AC72D">' + 
		numerMonth + '/' + numerDate + '/' + numerYr + '</span>';
		
		if( typeof isAdmin !== 'undefined' )
		{
	    	$( modalContent ).clone(true, true).appendTo( "#modal" );
	    }
	    else
	    {
	    	$( modalContent ).clone(false, false).appendTo( "#modal" );
	    }	
		$("#modal").prepend(cellDate);
	}
	else if( displayType === 'week' )
	{
		//display the week and print button.
		
		//alert('You want to load the week into a modal.');
		//return false;
		console.log('common.js@modalOpen() displayType === week');
		modalContent = $(clickedObj).closest(".calRow");

		var mo = $($m).attr("ordinal");
		var yr = $($m).attr("yr");
		var modalTitle = $(clickedObj).attr("id") + " for "+ mo +" / "+yr; //something like Week-1		
	
		
		//display the year month title in the modal popup.
		modalTitle = '<span class="cursive" style="float:right;font-size:17px;color:#8AC72D">' + 
		modalTitle + '</span>';
		

		//when closing the modal window, we don't want to remove
		//the cloned original html, since we are not going to replace
		//it with any edits, so identify this week view modal from
		//a date view modal with a class: 'weekView'
		$("#modal").addClass('weekView');
	    $( modalContent ).clone().appendTo( "#modal" );	
		$("#modal").prepend(modalTitle);
		$("#modal").css('width', '95%');
		$("#modal").css('height', 'auto');
		//not editing in this modal so hide some tools:
		$("#modal .dragImg").addClass('hide');
		$("#modal .addNewLine").addClass('hide');
		$("#modal .modalImg").each(function()
		{
			$(this).addClass('hide');
		});
	}
	console.log('modalOpen about to complete code.  Remove hide class from blocker');
	$('.blocker').removeClass('hide');
	$('.blocker').css('opacity',0).animate({opacity: 1}, 10);	
	//required to run add listeners again to preserve the onclick editable events for lists
	addListenersToDom("false");
	
}

function modalClose(clickedObj)
{
	//obj clicked is a button within the open #modal element
	//model el's content child has attr of 'modalid'.
	//that unique modalid is the same as the class name of the
	//original content wrapper.  so val = attr('modalid'); 
	//so original content wrapper in the DOM can be located as: '$(getElementsByClassName(val)).html()';
	
	//if contents of ul with attr modalid = (ex: 'd8') 
	//does not equal contents of the modal (i.e., modal contents edited by user),
	//then modalSave is called before close the modal window.
	
	//call rearrangeJobs to remove drag icons from LI's and remove drag classes from UL & LI.
	//dragEditing is only defined in the admin.js file
	if( typeof dragEditing !== 'undefined' ){
		dragEditing = "ON";
		rearrangeJobs(clickedObj);
		
	}
	
	$("#modal").removeAttr("style");

	
	//this element is common to all types of modal content:
	$('#modal > span.cursive:first').remove();	
	$('#modal').find('li.context-style').first().removeClass('context-style');
	//prevent closing of modal while a context action menu is displayed.
	if( typeof isAdmin !== 'undefined')
	{
		
		if($("#divContextMenu").is(':visible'))
		{
		  	alert("Close This Popup before Exiting.");
			return;	
		} 
	}		

	//if this is a week view, the clone's original html should not be removed/replaced
	if( $("#modal").hasClass('weekView') )
	{
		//anything inside of #modal that has class hide, needs to have that removed:
		$("#modal").find('.hide').each( function()
		{
			$(this).removeClass('hide');
		});
		$("#modal").removeClass('weekView');
		//remove the content from the modal html:
		$('#modal > div.calRow:first').remove();

		modalSource = '';
		$('.blocker').addClass('hide');
		return true;
	}
	
	var modalUL = $("#modal").children("ul.edit");
		//var modalContent = $("#modal").children('ul').html();	//ul with li contents edited by user.
	//modalContent = $(modalUL).children('li').clone( true, true );
	//modalContent = $(modalUL).children('li').clone( true, true );
	
		  /* if(modalContent){
			   console.log("modalContent is defined as "+modalContent);
		   }*/
	
	// BUG!!!!!  The modalid is the same value for all matching dates of the calendar:
	// EX: April 2 and Dec 2 BOTH HAVE modalid=2.
	// This causes the modal window when closed, to duplicate changes from the UL of the modal window
	// Across all dates of the calendar that match modalid's.  12 x.
	
	//TODO: Fix this bug by grabbing also the month as id=mo, attribute ordinal= [number of the month], and (when there are
	// multiple years in a calendar, to avoid duplication on the date and month), id=yr, ordinal [number of the year]
	
	var objMonth = $(modalUL).attr('ordinal');
	var objYear = $(modalUL).attr('yr');
	
	
	// the dom object to save changes to in the calendar.
	var saveTarget;
	var modalId = $(modalUL).attr('modalid'); //used to locate the original UL in the DOM
	//$(".month").each( function(){
		
		    //find each div.month.  Compare attribute values for ordinal and yr, compare to same values in the 
		 //  	if($(this).attr('yr') == objYear && $(this).attr('ordinal') == objMonth){
				//console.log('This Month\'s Ordinal: '+ $(this).attr('ordinal'));
				//console.log('This Month\'s yr: '+ $(this).attr('yr'));
				//console.log("objYear is " + objYear);
		    		//console.log("objMonth is " + objMonth);
				// correct month to update contents.  Find the correct date of this month:				
			//	saveTarget = $(this).find("ul[modalid='" + modalId + "']");
				//$("#modal").find('li').clone( true, true ).appendTo(saveTarget);
		   		//$(modalContent).html() = ""; //clear out the old html in the calendar cell.
		   
		   // modalUL is: var modalUL = $("#modal").children("ul.edit");;
		   // modalContent is the UL in the calendar of the clicked list that opened popup editor.
		   // that is: modalContent = $(clickedObj).parents('.date').children('ul');
		   
		   		//modalContent is the Calendar's UL DOM object, that was defined when modalOpen was last called.
		   
		   
		   
	
		   
		   
		   
		    if( typeof isAdmin !== 'undefined' )
		    {
		    	console.log("We will clone the UL and its listeners-ADMIN");
		    	$( modalContent ).replaceWith( $( modalUL ).clone(true, true) );
		    }
		    else
		    {
		    	console.log("We are not an Admin, so clone the UL without its listeners");
		    	$( modalContent ).replaceWith( $( modalUL ).clone(false, false) );
		    }
		         
		    addListenersToDom("true");
		   
	   		// add listeners afresh to the calendar target UL, modalContent:
	   		
	   		$(modalUL).remove();
	  
			modalSource = '';
			$('.blocker').addClass('hide');
		   
		
}

function modalSave(destination, source)
{
	if( typeof isAdmin !== 'undefined' )
	{
		//clone it back to the source with event listeners intact.
		//need to add in your contextmenu event handler.  Clone could not 
		//copy those for some reason:
		
		//if the modal source contains contextMenu html, remove it first.
		/*if( $(source).find('#divContextMenu') ){
			$(source).find('#divContextMenu').remove();
		}*/
		
		//now save the modal content to the original date cell of the calendar
		//console.log("Source: " + source);
		destination.html(source);
		//console.log("The HTML to copy to the cal is: "+ $(source).html() );
		//addListenersToDom();
		
		
			 
		// alert("editboxes is: " + editboxes);
		 
		 $.each(destination, function(i, elem){		 
			 destination[i].addEventListener('click', startEdit, true);
			 //var dateBox = editboxes[i].parentNode; //parent of the edit box.
			//evt.stopImmediatePropagation();stopPropagation()
			if(typeof isAdmin !== 'undefined')
			{
				bindListeners4EachList(destination);
			}
			//listsIntoObjects(destination,i);
		 });	 
	 }			
}


function hideSearchResult(){
	if( $('#srchResult').is(':visible') ) {
		$( '#srchResult').empty();
		$("#search").val('');
		$('#srchResult').addClass('hide');	
		
	}
}

//back and forward through the month navigation
function displayNewMonth(action)
{
	wait('start');
	var allMonths = $(".month");
	
	if(action==='next') //display next month
	{
		// parseInt(month); //global cur mo as string (e.g. "7" for July). Convert to int. for math.		
		// Check 1st if there is HTML available for job listings for the next month being requested
		// if ! class="month" ordinal="12" (if the DOM does not find that attr == to month+1 (12), 
		// then giveNotice that there is no job scheduled in that month yet.
		// +1 for next, -1 for previous month being requested.	 We need to track YEAR as well for multiyear navigation.	
				
		if( parseInt(month) < 12 ){ //stay on the same year.
			var nextMonth =  String(parseInt(month) + 1);
			//console.log('the month is not dec.');
			var validMonth = monthHTMLexists( allMonths, nextMonth, year ); //does next mo exist in the DOM?
					//console.log(validMonth,allMonths);
		
		   if( validMonth !== 'ok'){
			   giveNotice('<span style="color: #FF0000">There is No Job Data Stored for that Month.</span>');

			   wait('end'); //hide the animated processing graphic
			   return; //get outta town
		   }
			
			$(allMonths).each(function(i,mo){
				/*
				if($(mo).attr("ordinal") == month){ //this is the current month we want to hide.
					$(mo).addClass("hide");
				}*/
				 /* hide all instead.. except the one we are nav to */
				$(mo).addClass("hide");   
				
				if($(mo).attr("ordinal") == nextMonth && $(mo).attr("yr") == String(year) ){
					$(mo).removeClass("hide");
					month = String(nextMonth); //set the month var to the new month displayed.
					curMonthCounter = month;
					 //$("#mo").html(monthName);
					$("#mo").html(monthName[month]);
					$("#mo").attr("ordinal",month);
					$("#mo").removeClass("hide");					
				} 
					
			});
			wait('end'); //hide the animated processing graphic
			   return; //get outta town
			//loadCalendar(curCompany, month, year);
		} 
		else //the month is dec (12)
		{ //need to roll over to next yr
				
			
			//console.log('the month is dec and the year is ' + year);	
			//all .month, ordinal month to search DOM, yr attrib val to seach DOM		
			var validMonth = monthHTMLexists( allMonths, "1", String( parseInt(year) +1 ) ); //does next mo exist in the DOM for the year requested?
					
		   	if( validMonth !== 'ok'){
				//there is not a DOM element for that year/mo combination.			   	
			   	giveNotice('<span style="color: #FF0000">There is No Job Data Stored for that Month.</span>');
			  	wait('end'); //hide the animated processing graphic
			   	return; //get outta town
		   	} else {
				nextMonth = "1";
				year = String( parseInt(year) +1 );				
				$(allMonths).each(function(i,mo){				
				    /*if($(mo).attr("ordinal") == "12"){ //this is the current month we want to hide.
					    $(mo).addClass("hide");
				    }*/
				     /* hide all instead.. except the one we are nav to */
				    $(mo).addClass("hide");   
				    
				    if($(mo).attr("ordinal") == nextMonth && $(mo).attr("yr") == String(year)){
					    $(mo).removeClass("hide");
					    month = String(nextMonth); //set the month var to the new month displayed.
					    curMonthCounter = month;
						//$("#mo").html(monthName);
					    $("#mo").html(monthName[month]);
					    $("#mo").attr("ordinal",month);
					    $("#mo").removeClass("hide");	
					   $("#yr").html(year);
					   $("#yr").attr('ordinal', year);		 			 
					   //$(mo).attr('yr', year);						
				    } 					
			}); 			   						
			    wait('end');
			    return;
			}// else is a valid month/yr combo in the DOM
		}		
	} //if nav is "next" month
	else //action is to display the 'prev' month
	{		
		if( parseInt(month) > 1 ){
			//no need to roll back the year
			var nextMonth = parseInt(month) - 1;
			var validMonth = monthHTMLexists( allMonths, nextMonth, year ); 
			//does next mo exist in the DOM for on the year requested?					
		   	if( validMonth !== 'ok'){
				//there is not a DOM element for that year/mo combination.
				 
			     giveNotice('<span style="color: #FF0000">There is No Job Data Stored for that Month.</span>');
			     wait('end'); //hide the animated processing graphic
			     return; //get outta town
		   	} else {
			    
			    $(allMonths).each(function(i,mo){				
				    /*if($(mo).attr("ordinal") == month){ //this is the current month we want to hide.
					    $(mo).addClass("hide");
				    }*/
				     /* hide all instead.. except the one we are nav to */
				    $(mo).addClass("hide");   				
				    if($(mo).attr("ordinal") == String(nextMonth) && $(mo).attr("yr") == String(year)){
					    $(mo).removeClass("hide");					
					    curMonthCounter = month;
						//$("#mo").html(monthName);
					    $("#mo").html(monthName[nextMonth]);
					    $("#mo").attr("ordinal",nextMonth);
					    $("#mo").removeClass("hide");
				    }
			    });
			    month = String(nextMonth); //set the month var to the new month displayed.
			}//end else is validMonth
		} else if(parseInt(month) == 1) { //need to roll back to prev yr				
			
			//console.log('the month is dec and the year is ' + year);	
			//all .month, ordinal month to search DOM, yr attrib val to seach DOM	
			var prevYr = parseInt(year) -1;	
			//console.log("prevYr is " + prevYr);
			var validMonth = monthHTMLexists( allMonths, "12", prevYr ); 
			//does next mo exist in the DOM for the prior year?					
		   	if( validMonth !== 'ok'){
				//there is not a DOM element for that year/mo combination.				 
			     giveNotice('<span style="color: #FF0000">There is No Job Data Stored for that Month.</span>');
			     wait('end'); //hide the animated processing graphic
			     return; //get outta town
		   	} else {			
			
			var nextMonth = "12";
				year = String( parseInt(year) -1 );				
				$(allMonths).each(function(i,mo){				
				    /*if($(mo).attr("ordinal") == "12"){ //this is the current month we want to hide.
					    $(mo).addClass("hide");
				    }*/
				     /* hide all instead.. except the one we are nav to */
				    $(mo).addClass("hide");  
				});
				 $(allMonths).each(function(i,mo){	   
				    if($(mo).attr("yr") == prevYr && $(mo).attr("ordinal") == nextMonth ){
					    $(mo).removeClass("hide");
					    month = String(nextMonth); //set the month var to the new month displayed.
					    curMonthCounter = month;
						//$("#mo").html(monthName);
					    $("#mo").html(monthName[month]);
					   // $("#mo").attr("ordinal",month);
					   // $("#mo").removeClass("hide");	
					    $("#yr").html(year);
					    //$("#yr").attr('ordinal', year);		 			 
					   //$(mo).attr('yr', year);						
				    } 					
			}); 				
			
		}//else validmonth ok
		
	}//else try roll back one year from month 1 to 12
	wait('end');
	var func = addListenersToDom("false");
	window.setTimeout(func, 100);
	
}//else prev
}

// verify DOM contains HTML of job listings for a user navigated month
// allMonths is all DOM els of class "month"
// action is "next" or "prev" nav request 
//the month to check
function monthHTMLexists(allMonths,checkMonth,yr){
	
	 var result = false;	 
	// TODO: Check allMonths is not null, empty
	
	checkMonth = String(checkMonth);	
	 
	//console.log('checkMonth is: ' + checkMonth + ' and yr is: ' + yr );
	$(allMonths).each(function(i,el){
		//get the value from the element's "ordinal" attribute that matches the
		//requested month to navigate to.  If it doesn't exist in DOM, then return false;	
		//console.log("EACH has fired!");
		if( $(el).attr("yr") === String(yr) ){
			if(  $(el).attr("ordinal")  === String(checkMonth) ){			
			  //e.g. el looks like: <div class="month" ordinal="10" yr="2016">
			  //we found a DOM el with the requested month and having the same (current) year.
			  //console.log($(el).attr("ordinal"));
			  result = 'ok';	
			}
		} 
	});
	
	return result; //if undefined, there is not a DOM for that month+yr
		
}



function printAnyElement(elemId) {
	$( "#modal" ).clone().appendTo('#print');
	$( "#print" ).removeClass( "hide" );
	$("#print").find('img').remove();
	//$( "#print img.modalImg" ).addClass( "hide" );
	$("#print").find( 'button' ).remove();
	//$( "#print .smBtn" ).addClass( "hide" );
	
	 var printArea = window.open('', '_blank', 'scrollbars=yes,resizable=yes,top=20,left=5,height=900,width=1200');
	 printArea.document.write('<html><head><title>Print Request</title><link rel="stylesheet" href="/calendar/styles/bootstrap.min.css" media="all"><link href="/calendar/styles/print_1.css" media="print" rel="stylesheet" /> <link rel="stylesheet" href="/calendar/assets/icomoon/style.css">');


	 printArea.document.write('</head><body id="printBody" style="font-size:14px !important">');
	 printArea.document.write( $( "#print" ).html() );
	 printArea.document.write('</body></html>');

	 printArea.document.close();
	 printArea.print(); 
	 $( "#print" ).empty();	     
     $( "#print" ).addClass( "hide" );
    console.log('Print Any Element func called.');
    $( "#modal img.modalImg" ).removeClass( "hide" );
	$( "#modal button" ).removeClass( "hide" );
	$( "#modal .smBtn" ).removeClass( "hide" );
    modalClose();
}
	
function cleanCalendarLayout(){
	$('#print').empty();
	/*
	var headTag = '<body><html><head><title>Print Calendar</title><link href="customsigncenter.com/calendar/styles/print_1.css" media="all" rel="stylesheet" /> <link rel="stylesheet" href="http://customsigncenter.com/calendar/assets/icomoon/style.css"> <link href="http://customsigncenter.com/calendar/styles/bootstrap.min.css" rel="stylesheet" /> </head><body>';
	
	 $('#print').html('headTag');
	 */
	
	 $( "#pageTitle" ).clone().appendTo('#print');	
	 $( "span#date" ).clone().appendTo('#print');			
	 $( "span#curTime" ).clone().appendTo('#print');
	 // to apply clearfix to wrapper of WIP icons, get wrapper of #icons:
	 // #checkBoxWrapper
	// $( "#icons" ).clone().appendTo('#print');
	 $( "#checkboxWrapper" ).clone().appendTo('#print');
	 $( "span#mo" ).clone().appendTo('#print');
	 $( "span#yr" ).clone().appendTo('#print');
	 $( "#headerDays" ).clone().appendTo('#print');
	 $( ".month" ).clone().appendTo('#print');
	//remove ALL img tags
	 $( "#print" ).find( "img" ).remove();	 
	//$( "#print img.modalImg" ).addClass( "hide" );
	$( "#print" ).find("button").remove();
	$( "#print" ).find("input").remove();
	 

}
	
		
// you could use set() which builds on the set only if it does not already exist.
//$('#search').on('keyup',function(){
$('#search').on('input',function()
{
   
	var searchTerm = $(this).val().toLowerCase();
	var results = [];
	var domObjs = [];
	//console.log('on input fired');
   //require search terms of 3 chars or more
   if(searchTerm.length > 2)
   { 
	
	   $('li.lineEntry').each(function(i,list)
	   {
		  if(typeof list !== 'undefined')
		  {
			  console.log('LI is defined in .each');
		   	  var lineStr = $(this).text().toLowerCase().trim();
		  }
		   // -1 returned if searchTerm not found in LI string
		  if( lineStr.indexOf(searchTerm) === -1 )
		  {
			 console.log('lineStr.indexOf(searchTerm) === -1');
		  }else{	
			 console.log('FALSE = lineStr.indexOf(searchTerm) === -1');
			 // results.push(lineStr);
			  domObjs.push(list); //lineEntry Ojb with matched content			
			  results.push(lineStr);

		  }	//else	   
	   }); //each
		
		// output to the view
	
		if(domObjs.length>0)
		{	
			
			$('#srchResult').removeClass('hide');			
			$( '#srchResult').empty(); //clear out displayed results with each on.input		
			
			var br =  document.createElement( "br" );								
			$( domObjs ).each( function( i,res )
			{	
				
				var thedate = $( res ).parent( '.edit' ).attr( 'modalid' ); //e.g., d21 for the 21st date of a month.	
			  	
				if( typeof thedate !== 'undefined' && thedate.length > 1 )
				{
					thedate = thedate.replace('d', '');
			  		var month = $(res).closest('div.month').attr('ordinal');
					var yr = $(res).closest('div.month').attr('yr');
				  	thedate = month + "/" + thedate + "/" + yr;
				  	//console.log("found "+ searchTerm + " on " + thedate);
					//results[i] = thedate + ': ' + results[i];						
				} // if defined
				
				if( typeof res !== 'undefined')
				{ //  && $(res).html().indexOf(searchTerm) !== -1 					
					
					//$('#srchResult').append( "<div class='result"+i+"' >Date: " + thedate + ", " + $(res).html() ).append("</div><br/>");
					$("#srchResult").append( "<div style='cursor:pointer' class='result"+i+
						"'  >Date: " + thedate + ", " + $(res).html() + "</div>");
					
					
					
					$( document.body ).find('.result'+i).on('click', function() 
					{
						console.log('.result'+i+' found, ready to send that to modalOpen()');
						$(res).addClass('context-style');
						//modalOpen($(res).closest('.modalImg'));
						modalOpen(res, 'day');
					});
				}				
				
			});  // each results				
					
		}//if domObjs has members
		else 
		{
			hideSearchResult();
		}	
				   
    }//end if search term > 2
	else 
	{
		$('#srchResult').removeClass('hide');
		$('#srchResult').html( '[ Search Requires 3+ Characters. ]' )
	}				  			
}); //on.input
		
$('#srchResult').parent('form').on('focusout',function(){			
	if( $('.blocker').hasClass('.hide') ){				
		hideSearchResult();
		$( '#srchResult').empty();			
	}		
});
		
//'<div id="x"><button onclick="saveNote(this,'+listEl+')">Save</button><br><input type="textarea" id="y" value="" /></div>	
	// obj param references dom 'save button', from the above html.
	
		
		//general toggle show hide; param is the target DOM element
		
		function toggleVisibility(target){
			var $t = $(target)
			if( $t.hasClass( 'hide' ) ){
				$t.removeClass( "hide" );
			} else {
				$t.addClass( "hide" );
			}
			
		}
		


//universal confirm / cancel dialog func
function confirmRequest(msg)
{	    
   var r = confirm(msg);
   return r; //returns false if cancel/close or true if ok.	
}




//called on change handler for checkboxes (show hide)
//param chkBoxName = checkbox input attr "name"'s value
//the name should == the class name for each icon
//e.g., name = "ic-cog", etc.
//param checked will be true if this is a checkmark (show)
//and false if it is unchecked (hide)
function hideShowIconJob(chkBoxName,checked){
	console.log("Called hideShowIconJob to hide or show checkbox name: "+chkBoxName+".");
	//Error: Syntax error, unrecognized expression: i .ic-i-ret-trip"
	var iconsToHide = "i."+chkBoxName; //set it as a class with a dot
	var iconMarkedJobs = $("#calWrap").find(iconsToHide);	
	if(checked === true)
	{
		//console.log("checkbox is checked.  Dom element to unhide is: "+ iconsToHide);	
		$(iconMarkedJobs).each(function(ndx, domObj){
			//console.log("try to show these jobs.");
			$(this).closest('li.lineEntry').removeClass('hide');
		});
	}
	else
	{
		console.log("checkbox is UNchecked. Dom element to hide is: "+ iconsToHide);
		$(iconMarkedJobs).each(function(ndx, domObj){
			//console.log("try to hide these jobs");
			$(this).closest('li.lineEntry').addClass('hide');
		});	 							   
	}	
}

function printWindow(){
	
	//cleanWindow is called before this.  It already has placed the calendar html into
	//the div#print and hidden images, etc.
	$( "#print" ).removeClass( "hide" );
	 var printWindow = window.open('', '', 'scrollbars=yes,resizable=yes,top=20,left=5,height=900,width=1200');
	 printWindow.document.write('<html><head><title>Print Calendar</title><link rel="stylesheet" href="/calendar/styles/bootstrap.min.css" media="all"><link href="/calendar/styles/print_1.css" media="print" rel="stylesheet" /> <link rel="stylesheet" href="/calendar/assets/icomoon/style.css">');
	 
	 var $editULs = $("#print").find(".edit");
		
	//hide empty ul.edit -- this works, but the calendar does not really save any space
	//with the current layout used for printing.
	/*	$( $editULs ).each(function(i,ulEl){
			
			if( $(ulEl).find('li').length < 1){
				$(ulEl).parent('.date').addClass('hide');				
			}
			
		});
	*/
	
	$( $editULs ).each(function(i,ulEl){
		 
		 if( $(ulEl).find('li').length < 1){
			 $(ulEl).parent('.date').attr('style', 'border:none');				
		 }
		 
	 });
 
	 //add clearfix class to wrappers to hold floats on a single line.		
	 var floatWraps = ['#headerDays','.calRow','#teams','.row'];
	 
	 $(floatWraps).each(function(i,el){
		 $('#print ' + el ).addClass("clearfix");
	 });
	 	 
	 printWindow.document.write('</head><body id="printBody">');
	 printWindow.document.write( $( "#print" ).html() );
	 printWindow.document.write('</body></html>');
	 printWindow.document.close();
	setTimeout(function () {
        printWindow.print();
    }, 500);    
	 
	 $( "#print" ).html('');
	 $( "#print" ).addClass( "hide" );
	return false;
	
}	


//tests whether obj is empty returns true if empty.
function onloadSetOverdueDisplay(){
	console.log('onloadSetOverdueDisplay called.');
	wait('start'); //spinner gif indicating busy
	var $overdues = $("#weeks").find("li.due");	
	wait('end'); 
	$.each($overdues, function(i, d){
		//  alert("overdue found");
		  //list this in the view of overdue jobs.
		 var jobNmbr = $(this).children('span').first().text(); //the job number parent span is always the first one in the LI.
		//alert("Job# is " + jobNmbr);
		//2. get the date of the edited job's UL wrapper's modalid.
			var date = $(this).parent('ul').attr('modalid').substr(1); //ex: d10 becomes 10 = date
		//3. trim off the first char ('d') from the modalid value, leaving just the numeral.
			//date = date.substr(1);
			var mo = $(d).closest( ".month" ).attr('ordinal');
			var yr = $(d).closest( ".month" ).attr('yr');
			date = '<span style="color: red">'+ mo + '/' + date + '/' + yr+'</span>';
		//get the job desc text and truncate it to the first 30 chars.
			var desc = $(this).text();
			desc = desc.slice(0,30);
		//concat into a line of text to save as a property of overdueJobs obj.
			var info = '<div class="ovrDue" id="'+jobNmbr+'">' + date +': '+ desc +'...</div>';
		if( overdueJobs.hasOwnProperty(jobNmbr) === false ){
			overdueJobs[jobNmbr] = info;
		}

		});

	if( isEmpty(overdueJobs) === false ){
		console.log('overDueJobs is not an empty obj; lets display those jobs.');
		//first erase all the content of the overdue job list in the view:
		$('#OverDueJobsList').html('');

		//write all the updated overdue jobs to the view:
		//by iterating through the overdueJobs properties:
		Object.keys(overdueJobs).forEach(function(key) {
			//console.log('Appending another job: '+key);
			$('#OverDueJobsList').append(overdueJobs[key]);
		});		
		/*$('#OverDueJobsList').prepend('<p><span class="due" style="padding: 3px 8px !important; font-size: 18px">Overdue Jobs</span></p>');*/
	} else {
		//console.log('overDueJobs is an empty obj.');
		// no overdueJobs to output to the calendar view.
		$('#OverDueJobsList').html('<p>Excellent! All WIPs are On-Schedule.</p>');
		
	}		
				
	
}

function isEmpty(obj) {
   console.log('isEmpty called to see if the overdue jobs obj is empty.');
   //check if it's an Obj first
   var isObj = obj !== null 
   && typeof obj === 'object' 
   && Object.prototype.toString.call(obj) === '[object Object]';

   if (isObj) {
       //"var o", simply represents any property at all, no matter its name.
       for (var o in obj) {
           if (obj.hasOwnProperty(o)) {
			// this is not an empty object.
			   console.log('It is not an empty object.');
               return false;
               break;
           }
       }
	   console.log('It is reported as an empty object.');
       return true;
   } else {
       console.error("isEmpty function only accepts an Object");
   }
}

/* 
 * build/renew HTML display for team assignment checkbox 
 * On document load / new company calendar selected.
 * toggle show/hide jobs functions:
 */
function renewTeamIconCheckboxDispaly()
{
	//construct company-specific icon assignment displays:
	//the jobAssignment(1, this) function requires an int value
	//sent to it from the Task Menu.
	teamIconsDisplay='<div class="row"><span style="padding-top:12px;float:left; clear:left">Assignment: &nbsp;</span>';
	$.each( iconAssignments[curCompany], function(k,v){
		// the k is the CSS class to use; the value is the label:
		
		if(null !== v){	
			if( parseInt(k,10) < 10 ){
				let br = '';
				if(k==7){br = "<br/>";}
			teamIconsDisplay += br+br+'<div class="iconrow">'+
					'<input style="float:left" type="checkbox" id="select-'+k+'" '+
						'name="t'+k+'" value="'+k+'" checked="checked">'+
      				'<div class="box-label t'+k+'" id="l'+k+'">'+
					'<li id="t'+k+'" class="t'+k+'" onclick="jobAssignment('+k+', this)" option="'+k+'">'+
					v+'</li></div></div>';	
			} else {
				//this needs to have an icon displayed with the html:
				//v = 'ic- class name/number for t10, select-10, etc'
				var val = v.split("/");				
				/*ups example: "10":"UPS/ic-ups" k:v
				  val[0] = 'UPS'; val[1] = 'ic-ups'; k = 10				
				*/
				teamIconsDisplay += '<div class="iconrow">'+  		
				'<input style="float:left" type="checkbox" id="select-'+k+'" name="'+val[1]+'" value="'+val[0].toLowerCase()+'" checked="checked">'+
				'<div class="box-label" id="l'+k+'">'+
					'<li id="'+val[0].toLowerCase()+'" class="t'+k+'" onclick="jobAssignment(\''+val[0].toLowerCase()+'\', this)" option="'+
						val[0].toLowerCase()+'">'+
						'&nbsp;<i class="'+val[1]+'"></i>'+
						val[0]+
					'</li>'+
				'<!--1--></div>'+
			'<!--2--></div>';
			}
		}		
	});
	
	//add in the JOB STATUS and the PERMIT STATUS rows of Checkboxes:
	teamIconsDisplay += '</div><div class="j row">'+
		'<span style="padding-top:12px;float:left; color:#0d58a1;">Job Status: &nbsp;</span>'+	   
		'<div class="iconrow">'+
			'<input style="float:left" type="checkbox" id="select-12" name="ic-i-ret-trip" value="t12" checked="checked">'+
			'<div class="box-label" id="l12"><li id="ic-i-ret-trip" onclick="jobAssignment(\'trip\', this)" option="trip">'+
			'<i class="ic-i-ret-trip"></i> Service</li></div>'+
		'</div>'+
		'<div class="iconrow">'+
			'<div class="box-label" id="l13"><li id="13" '+
			'onclick="jobAssignment(\'crew\', this)" option="crew"><i class="ic-users"></i> 2-Man</li></div>'+
		'</div>'+
		'<div class="iconrow">'+			
			'<div class="box-label ic-i-comp" id="l14"><li id="14" onclick="jobAssignment(\'crane\', this)" option="crane">'+
		'<i class="ic-i-crane"></i> 100ft Crane</li></div>'+
		'</div>'+
		'<div class="iconrow">'+			
			'<div class="box-label" id="l15"><li id="15" onclick="jobAssignment(\'parts\', this)" option="parts"> '+
			'<i class="ic-cog"></i> Part Needed</li></div>'+
		'</div>'+
		'<div class="iconrow">'+
			'<input style="float:left" type="checkbox" id="select-16" name="ic-i-comp-alt" value="t16" checked="checked">'+			
			'<div class="box-label" id="l16"><li id="16" onclick="jobAssignment(\'comp\', this)" option="comp">'+
		'<i class="ic-i-comp-alt"></i> Ready to Invoice</li></div>'+
		'</div>'+
		'<div class="iconrow">'+
			'<input style="float:left" type="checkbox" id="select-17" name="ic-i-comp-inv" value="t17" checked="checked">'+
			'<div class="box-label" id="l17"><li id="17" onclick="jobAssignment(\'inv\', this)" option="inv">'+
			'<i class="ic-i-comp-inv"></i> Collect</li></div>'+			
		'</div></div>';
  
	
			//PERMITS ROW:
	       teamIconsDisplay += '</div><div class="p row">'+
	'<span style="padding-top:12px;float:left;color:#0f8040">Permit Status: </span>'+
	 '<div class="iconrow">'+				
		'<div class="box-label" id="l18"><li id="18" onclick="jobAssignment(\'info\', this)" option="info"><i class="ic-p-inf">'+
		'</i> Need Info</li></div>'+
	'</div>'+
	'<div class="iconrow">'+					
		'<div class="box-label" id="l19"><li id="19" onclick="jobAssignment(\'inspr\', this)" option="inspr"><i class="ic-p-insp-req">'+
		'</i> Insp. Req\'ed</li></div>'+
	'</div>'+
	'<div class="iconrow">'+
		'<div class="box-label" id="l20"><li id="20" onclick="jobAssignment(\'inspa\', this)" option="inspa">'+
		'<i class="ic-p-insp-appr"></i> Insp. Appr\'d</li></div>'+
	'</div>'+
	'<div class="iconrow">'+
		'<div class="box-label" id="l21"><li id="21" onclick="jobAssignment(\'pappr\', this)" option="pappr" title="Prmt Completed or Not Required">'+
		'<i class="ic-p-appr"></i> Done/Not Needed</li></div>'+
	'</div>'+
	'<div class="iconrow">'+
		'<input style="float:left" type="checkbox" id="select-22" name="ic-asterisk" value="t22" checked="checked">'+
		'<div class="box-label" id="l22"><li id="22" onclick="jobAssignment(\'prmt\', this)" option="prmt">'+
		'<i class="ic-asterisk"></i> Prmt Only</li></div>'+
	'</div></div>';
	$('#teams').html('');
	$('#teams').html(teamIconsDisplay);
	
}


function changeCompanyCalendar()
{
	//$("#company" ).val( this.value ); // or $(this).val()	
		
		justReloaded = 1;
		curCompany=$( "#companyCalendar option:selected" ).val();
		$("#pageTitle").html(curCompany + " WIP Calendar");
		if(  typeof teamNamesHTML === 'function' ){
			teamNamesHTML();
		}
		loadCalendar( curCompany,-1,-1 ); //load calendar calls addListenersToDom func.
		//addListenersToDom("true");		
		
		/*if(curCompany !== "Custom Sign Center"){
			alert('Planned Update: Calendar Jobs Will Change for Each Company.');
		}*/
}

	/*

function toggleText(){	
	if($("#overdueReveal").text() === 'Expand List'){
		$("#overdueReveal").text('Minimize List');
	} else {
		$("#compSelectorBtn").text('Expand List');
	}
}

*/

/*
When editing via:


1. Reschedule
2. assignment type (colorize)
3. assignment process/status (icon)
4. Admin-Note (add, edit)
5. Copied



js object pendingUpdates

properties include:


"location":{
	"yr": 
	"mo": 
	"cell": //ordinal value
},

"jobNumber": nmbr,

"changes": { 

	"resched" : {		if not empty...
				"contents":cloned html,
				"target": save to cell
		 	},

	"classes" : { [ 0: "target":domObj, "classNames": 'hide unassigned ', 1: [ "target":domObj, "icon":   ]  },


	"icons" : {  [ 0: "target":domObj, "icon":  , 1: [ "target":domObj, "icon":   ] ] }
	
	"notes" : 
	
	
	"copies" : {}

				
*/

/*

// record to obj 'pendingUpdates' all data changes to the calendar
// called by save()
function updateTransaction(){
	
	//acquire freshest state of calendar data from remote xml.
	loadCalendar(); // this temporarily removes user's updates from the live html.
	
	//apply each pendingUpdates row to its respective cell in live html.
	$.each(pendingUpdates, function(){
		
		
		
		
	}); //pendingUpdates each.
	
	
	
	
}

// 


// called by logout button event
// if pendingUpdates has content, warn user they exit without saving.
function confirmLogout(){
	
	
}


*/


/*	TODO:
//Purpose: allow a logged in user to "chat" toward the mgr/admin occupying the editable calendar
//Check the Message Subsystem for User Msgs:
function CheckMessages() {
	
	_checkMessageCounter++;
   
    var msgPanel = document.getElementById("intercom");
    if (msgPanel)
        msgPanel.innerHTML = (MSG_TIMEOUT - _checkMessageCounter) + "";
    if (_checkMessageCounter >= MSG_TIMEOUT) {
        
	    //see if there are any recent message flat files.
	    
	    
	    
	    
        if (answer) 
        {
            //document.location.href = "login.php";   
            _idleSecondsCounter=0;
        }
        else{
            //window.open('', '_self', ''); window.close();
            document.location.href = "login.php";
        }

    }
 }
	
	*/



/* Possible TODO :: User Backups
/*	NEVER USED
function backUpCal(e){
	
	
		
	e.preventDefault;
	
	var today = new Date();
	var date = (today.getMonth()+1)+'-'+today.getDate() +'-'+today.getFullYear();
	/*
	if
	
	var filename = ;
	
	if($('input name[filenameSuffix]').val() !== '' && typeof $('input name[filenameSuffix]').val() !== 'undefined'){
		filename = date + '_' + $usr + '_' + curCompany.replace(' ', '-') + '_' $('input name[backupfilename]').val();
	} else {
		filename = date + '_' + $usr + '_' + curCompany.replace(' ', '-');
	} 
	*/
	/*
	$("#weeks").find('.context-style').removeClass('context-style');
	//if there is an open #divContextMenu, got to close it so it isn't saved into the xml.
	var $openMenus = $('.month').find('#divContextMenu');
	$($openMenus).each(function(i,menu){
		$(menu).remove();
		
	});
		
	wait('start');
	var htmlDataToSave = $("#weeks").html();
	var data={"content":htmlDataToSave,"company":curCompany};
	
	//update the appropriate cell node in the xml
	$.ajax({	
		  url : "classes/backup.php",
		  type: "POST",
		  data : data,
		  dataType:"json",
	   success: function(respData, textStatus, jqXHR)
	   {	
	   	  wait('end');
		  giveNotice('<span style="color: #009000">Success</span>: Your Updates have been Save.');
		  //giveNotice('<span style="color: #009000">Success</span>: Your Updates have been Save.');
		  //console.log(respData);
		  
	   },
	   error: function (jqXHR, textStatus, errorThrown)
	   {
		   wait('end');
		   giveNotice('<span style="color: #FF0000">Failed</span>: Server Response: "'+errorThrown+'"');
	   }	
  	});
	
	
}	
	
//create backup of cur cal
function backup(){

	var $calHtml = $("#weeks").html();
	//var $usr = $("#username").text();			
	$json = {"html":$calHtml,"company":curCompany,"username":$usr};

	$.ajax({
		url: "classes/backup.php",
		type: "post",
		data: $json,
		dataType: "json",			
		success: function(respData, textStatus, jqXHR){


		},
		error: function(respData, textStatus, er){



		}		    

	 });


} //backup()

*/


/*
function editHistory(action){
	//which action button clicked?
	if(typeof lastEditedCell != 'undefined'){
	    //undo last change
	    if(action=='undo'){
		    if(lastEditedCell.length < 1){
			    giveNotice('<span style="color: #FF0000">Failed</span>: No entries available to delete.');
		    } else {
			  // var index = lastEditedCell.length -1;
			   var undoCell=lastEditedCell.splice(-1,1);			   
			   redo.push({"redoText":undoCell[0][0].innerHTML,"redoHandler":undoCell});
		    	   undoCell[0].html(originalContent);//set the cell's content back to the original.
			   undoCell.slice(0,1);
			   giveNotice('<span style="color: #009000">Success</span>: Most Recent Change has been Reversed.');	
			   addListenersToDom();
		    }
		    // lastcellEdited = $(this);		    
	         // undo all changes; restore orig xml for the month
	    } else if(action=='undoall') {
		    //$("#weeks").html('');
		    //1st show all.  We probably cannot edit hidden elements
		    teamsShowAll();	    
		    
		    var undoAmt = lastEditedCell.length;
		    if( undoAmt > 0)
		    {
			 for(var i = 0; undoAmt > i; i++)
			 {
				var undoCell=lastEditedCell.splice(-1,1);	//remove one from the end of the array		   
				redo.push({"redoText":undoCell[0].innerHTML,"redoHandler":undoCell});
				undoCell[0].html(originalContent);//set the cell's content back to the original.
				undoCell.slice(0,1);
			 }
			  giveNotice('<span style="color: #009000">Success</span>: '+undoAmt+' change(s) have (has) been reversed.');
			  addListenersToDom();
		    }
		    else
		    {
			    giveNotice('<span style="color: #009000">OK</span>: There\'s Nothing to Undo.');
			    
		    }
		    	    
		    
		  
		    
		    
	    //action is 'redo'; redo last undo
	    } else  {
		    //lastEditedCell.html(content); old way when lastEditC was a simple variable, not an array
		    //new way with multiple undo/redo's:
		    if(Object.keys(redo).length<1){
			    giveNotice('<span style="color: #FF0000">Failed</span>: No entries available to undo.');
		    } else {
			    	//lastEditedCell.html(content); old way when lastEditC was a simple variable, not an array
				//new way with multiple undo/redo's:
				var index = Object.keys(redo).length -1; //find the index value of the last item of this obj.
				redoObj=redo.splice(index,1); //remove and assign the last redo item to redoObj before we redo it.
				//var hndlr = redoCell.handler; //the jquery object (edit div).
				redoObj[0].redoHandler[0].html(redoObj[0].redoText); //the old markup being restored to edit UL.
				//add the handler back onto the undo array:
				lastEditedCell.push(redoObj[0].redoHandler[0]);
				//redoCell = ''; //reset it.
				redoObj.slice(0,1);//clean it up
				giveNotice('<span style="color: #009000">Success</span>: Last Undo Request has been Reversed.');
				addListenersToDom();				
		    }
	    }
	 //no history saved
	} else {		
			giveNotice('<span style="color: #FF0000">Failed</span>: There\'s no revisions to update from.');
	}

}
*/
// end form buttons' functions



/* Not Used Anymore:

		//getUrlParams
		function getUrlParams(queryString){
			

		  // get query string from url (optional) or window
		 // var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

		  // we'll store the parameters here
		  var urlParams = {};

		  // if query string exists
		  if (queryString) {

		    // stuff after # is not part of query string, so get rid of it
		    queryString = queryString.split('#')[0];

		    // split our query string into its component parts
		    var arr = queryString.split('&');

		    for (var i=0; i<arr.length; i++) {
			 // separate the keys and the values
			 var a = arr[i].split('=');

			 // in case params look like: list[]=thing1&list[]=thing2
			 var paramNum = undefined;
			 var paramName = a[0].replace(/\[\d*\]/, function(v) {
			   paramNum = v.slice(1,-1);
			   return '';
			 });

			 // set parameter value (use 'true' if empty)
			 var paramValue = typeof(a[1])==='undefined' ? true : a[1];

			 // (optional) keep case consistent
			 paramName = paramName.toLowerCase();
			 paramValue = paramValue.toLowerCase();

			 // if parameter name already exists
			 if (urlParams[paramName]) {
			   // convert value to array (if still string)
			   if (typeof urlParams[paramName] === 'string') {
				urlParams[paramName] = [urlParams[paramName]];
			   }
			   // if no array index number specified...
			   if (typeof paramNum === 'undefined') {
				// put the value on the end of the array
				urlParams[paramName].push(paramValue);
			   }
			   // if array index number specified...
			   else {
				// put the value at that index number
				urlParams[paramName][paramNum] = paramValue;
			   }
			 }
			 // if param name doesn't exist yet, set it
			 else {
			   urlParams[paramName] = paramValue;
			 }
		    }
		  }

		  return urlParams;
			
	}//getUrlParams
	
	*/



		
/*

//display overdue to the user interface.
//generally called only when page loads
function displayOverDueJobs(){
	
	let wks = document.body.querySelector('div#weeks');
	let $due = wks.querySelectorAll('li.due');
	$.each($due, function(i,v){
		//alert("Found a due LIST: "+ v);
		editableLI = v;
		setOverDueJob();
		
;	});
}

*/