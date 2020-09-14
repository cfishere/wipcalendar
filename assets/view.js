/* global scope vars */
	var weeksDOM = $("#weeks");
	var headerYr = $("#headerYr");
	var curCompany = '';
	var timeoutID;
	var originalContent='';
	var content;
	var job;
	var curMonthCounter; //prev/next calendar month counting : increment/decrement
	
	var year;
	var month; //integer
	var monthName;
	var theDate;
	var todayOrdinalCell; //integer of the cell count for today's date.
	var changes=[];
	var responseMonth; //the most recent month html / data sent by php
	//relative pos html construct for claiming job entries.	
	var 	claimJobMenu;
	 
	var listElements = []; //all the list elements that hold job entries for showall/hideall. listsIntoObjects(){ listElements.push(liItem)} 
	var boxIDs = ['t0','t1','t2','t3','t4','t5','t6','t7','t8','t9','t10','unassigned'];
	
	var monthName = ["OccupyZeroPosition-PlaceHolder","January","February","March","April","May","June","July","August","September","October","November","December"];
	/*var jobClaimHTML = 
	'<div id="jobClaimMenu" class="hide">'+
	    '<p id="close" onclick="claimJob(0, this)" style="text-align:right;color:red">x Close</p>'+
	    '<p id="start" onclick="claimJob(1, this)">Start </p>'+
	    '<p id="continue" onclick="claimJob(2, this)" >Continue </p>'+
	    '<p id="complete" onclick="claimJob(3, this)">Completed</p>'+
	    '</div>';
	    */

	var dateParts;
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
				"4":null,
				"5":"Michael", 	//black
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

	
	
	
	var justReloaded = 1;
	
	var overdueJobs = {};		

function clearAlert() {
  window.clearTimeout(timeoutID);
}

$(document).ready(function (){
	
    
	/*disable back/forward page navigation of the browser*/
	history.pushState(null, null, document.title);
	 window.addEventListener('popstate', function () {
		history.pushState(null, null, document.title);
	 });	
	
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


	var weekRows = $( "#weeks .row" ); //each row
	//dispay the cal from xml when page first loads
	
	
$('#companyCalendar').on('change', function() {
  		//$("#company" ).val( this.value ); // or $(this).val()		
		justReloaded = 1;
		curCompany=$( "#companyCalendar option:selected" ).val();
		$("#pageTitle").html(curCompany + " WIP Calendar");
		if( typeof teamNamesHTML === "function" ){
			teamNamesHTML();
		}
		loadCalendar( curCompany,-1,-1 ); //load calendar calls addListenersToDom func.
		//addListenersToDom("true");		
		
		/*if(curCompany !== "Custom Sign Center"){
			alert('Planned Update: Calendar Jobs Will Change for Each Company.');
		}*/
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
	
	
	

	/*capture some keyboard keys and set to desired behaviors inside the .edit container*/

      
	 //add clearfix class to wrappers to hold floats on a single line.		
	 var floatWraps = ['#headerDays','.row'];
	 
	 $(floatWraps).each(function(i,el){
		 $('#print ' + el ).addClass("clearfix");
	 });
		
	
	
  
   //assign current company hmtl for the team names
   if( typeof teamNamesHTML === "function" ){
			teamNamesHTML();
	} 
   timeoutID = window.setTimeout(addListenersToDom, 500);	
   
}); // doc ready.

//callers set status to 'start' or 'end';
function wait(status){
	if(status=='start') { $( "#wait" ).removeClass( "hide" ); }
	else { $( "#wait" ).addClass( "hide" ); }
}

function addListenersToDom(showTeamsBool)
{    
	 //set teamnames into the icon checkboxes HTML for curCompany;
    renewTeamIconCheckboxDispaly();
	 var editboxes = document.getElementsByClassName('edit');	
	  $.each(editboxes, function(i, elem){		 
		 
		listsIntoObjects(elem,i);
	 });	 
	 
	 
	 // add listeners to the checkboxes to select the team entries to show or hide
	 // array of inputs - "toggle show / hide" input checkboxes array
	 //var checkboxes = $('#teamSelection').find('input');
	var checkboxes = $('#checkboxWrapper').find('input');
	 
	 $(checkboxes).each(function(i,box){
			 //change listener for each checkbox
		 $(box).on("change", function() {
			 //alert('Checkbox status changed!');
			 //which box changed? Answ = this
			 var chkBoxName = $(this).attr('name');
			 var chkBoxId = $(this).attr('id');
			 var ptrn =new RegExp(/^(?:ic-).*$/);
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
					for( var i = 0; listElements.length > i; i++ ) 
					{	
						if($(listElements[i]).hasClass(chkBoxName))				  		
						{
							$(listElements[i]).addClass("hide");
						}		
					}
				}
			 }
		 });		 
	 });
	 
	// dbl click any LI entry to claim the job; redirect user to the timeclock app
	// this construct is faster than conventional for loop and $.each
	/*var len = editboxes.length, x=0;
	for(x;len>x;x++){	
		editboxes[x].addEventListener("click", childClicked, false);
		//listElements[x].addEventListener("dblclick", getClickPosition, false);		
	}*/
	 //remove hide class from any hidden LI elements with a new loading of the page.
	 if(justReloaded === 1)
	 {	//reset the toggling variable to false
		 justReloaded = 0;
		 onloadSetOverdueDisplay();		 		 
	 }
	
	/*   //hide the first and last div in each .row (sundays and saturday columns)
    var eachMonth =  $("#weeks").find(".month");
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
    });	
    */
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
//handlers for each child LI or P inside the UL or DIV
//e is the clickevent for the parent (aka e.target).  The child clicked is e.currentTarget.
/*function childClicked(e){
	//insert the html opt menu in the p clicked.	
  var menus = $(document).find("#jobClaimMenu");
  if(menus.length){
	  $(menus).each(function(i,m){
		  $(m).remove();
	  }); 
  }
  
	$(e.target).append(jobClaimHTML);
	$("#jobClaimMenu").removeClass('hide');
	job = $(e.target).children('span').text();	
	 console.log(job);	  	
	 e.stopPropagation();
}
*/


/*
function getClickPosition(e) {
    var parentPosition = getPosition(e.currentTarget); 
    var xPosition = e.clientX - parentPosition.x - (claimJobMenu.clientWidth / 2);
    var yPosition = e.clientY - parentPosition.y - (claimJobMenu.clientHeight / 2);
    $(claimJobMenu).removeClass('hide');
    claimJobMenu.style.left = xPosition + "px";
    claimJobMenu.style.top = yPosition + "px";
}

//pop up options menu needs a position next to the click event (the LI obj)
// helper function to get an element's exact position
function getPosition(el) {
  var xPosition = 0;
  var yPosition = 0;
 
  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
      var yScrollPos = el.scrollTop || document.documentElement.scrollTop;
 
      xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
      yPosition += (el.offsetTop - yScrollPos + el.clientTop);
    } else {
      xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
    }
 
    el = el.offsetParent;
  }
  return {
    x: xPosition,
    y: yPosition
  };
}

*/
	

//company calendar to load, month to show, year to show (for next month, next year navigation)
/*php returns assoc array  (ex)
    [year] => 2016
    [activeMonthName] => June
    [activeMonthNumber] => 6
    [html] => (all the html of the calendar cells 
 */
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


		
function openModal(modalContent){		
		$('#modalWindow').html(modalContent);
		$('#modalWindow').removeClass('.hide');		
		$('#modalWindow').children('#modal')
		
}
function closeModal(){
	$('#modalWindow').find('.context-style').removeClass('context-style');
	$('#modalWindow').html('');
	$('#modalWindow').html('<div id="modal" class="modal"><button class="smBtn" onclick="closeModal(this)">Close</button></div>');   
	$('#modalWindow').addClass('.hide');
}
	

function teamsShowAll(){
	
	//check boxes for our job status icon items need checks restored to checkboxes		
	var JobStatusInputsWithCheckboxes = $('.j').find('input');
	$(JobStatusInputsWithCheckboxes).each(function(){
		//uncheck ea box
		$(this).prop('checked', true);				
	});
	
	
	$(listElements).each(function(i,entry)
	{
		$(entry).removeClass('hide');
	});
	
	var TeamChkBoxes = $("#teamSelection").find("input");
	$(TeamChkBoxes).each(function(x,box)
	{
		
			$(box).prop("checked", true);
		
	});
}
function teamsHideAll(){
	
	//hide every li item that contains an span->i-> with class begining with "ico-"	
	var JobStatusInputsWithCheckboxes = $('.j').find('input');
	$(JobStatusInputsWithCheckboxes).each(function(){
		//uncheck ea box
		$(this).prop('checked', false);
		var iconName = $(this).attr("name");		
		hideShowIconJob(iconName,false);		
	}); //done hiding all icon-assigned jobs
	
	
	//this.preventDefault();
	//alert('hide called');
	$(listElements).each(function(x,listItem)
	{
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
	//called on change handler for checkboxes (show hide)
//param chkBoxName = checkbox input attr "name"'s value
//the name should == the class name for each icon
//e.g., name = "ic-cog", etc.
//param checked will be true if this is a checkmark (show)
//and false if it is unchecked (hide)
function hideShowIconJob(chkBoxName,checked){
	console.log("Called hideShowIconJob.");
	//Error: Syntax error, unrecognized expression: i .ic-i-ret-trip"
	var iconsToHide = "i."+chkBoxName; //set it as a class with a dot
	var iconMarkedJobs = $("#calWrap").find(iconsToHide);	
	if(checked === true)
	{
		console.log("checkbox is checked.  Dom element to unhide is: "+ iconsToHide);
	
		$(iconMarkedJobs).each(function(ndx, domObj){
			console.log("try to show these jobs.");
			$(this).closest('li.lineEntry').removeClass('hide');
		});
	}
	else
	{
		console.log("checkbox is UNchecked. Dom element to hide is: "+ iconsToHide);
		$(iconMarkedJobs).each(function(ndx, domObj){
			console.log("try to hide these jobs");
			$(this).closest('li.lineEntry').addClass('hide');
		});	   
							   
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


	
	
function claimJob(opt,obj){
	//options 0=close, 1 = start claim, 2 = continue claim, 3=complete (clockout)
	
	
	if(String(opt) == "0"){
		$(obj).parent("#jobClaimMenu").remove;
	} else {
		var uriParam = "&job="+job;	
		var answer = confirm("Want to clock in now for job "+job+"?");
		if (answer==true){
		window.location.href = "https://customsigncenter.com/secure/timeclock.php?"+uriParam;
		}
		
	}
}

	
	
	
function cleanCalendarLayout(){
	 $( "#pageTitle" ).clone().appendTo('#print');	
	 $( "span#date" ).clone().appendTo('#print');			
	 $( "span#curTime" ).clone().appendTo('#print');
	 $( "#icons" ).clone().appendTo('#print');
	 $( "span#mo" ).clone().appendTo('#print');
	 $( "span#yr" ).clone().appendTo('#print');
	 $( "#headerDays" ).clone().appendTo('#print');
	 $( ".month" ).clone().appendTo('#print');
}
	
	function printWindow(){
	$( "#print" ).removeClass( "hide" );
	 var printWindow = window.open('', '_blank', 'scrollbars=yes,resizable=yes,top=20,left=5,height=900,width=1200');
	 printWindow.document.write('<html><head><title>Print Calendar</title><link href="styles/print_1.css" media="all" rel="stylesheet" /> <link rel="stylesheet" href="assets/icomoon/style.css"><link rel="stylesheet" href="styles/bootstrap.min.css">');
	 
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
	 var floatWraps = ['#headerDays','.row'];
	 
	 $(floatWraps).each(function(i,el){
		 $('#print ' + el ).addClass("clearfix");
	 });
	 	 
	 printWindow.document.write('</head><body id="printBody">');
	 printWindow.document.write( $( "#print" ).html() );
	 printWindow.document.write('</body></html>');
	 printWindow.document.close();
	 printWindow.print(); 
	 $( "#print" ).html('');
	 $( "#print" ).addClass( "hide" );
	
}
	
	

	//the img icon button click = clickedObj
function modalOpen(clickedObj) {
	/*
	alert("Popup Editor is Being Improved.  Currently Disabled Pending Updates.");
	return;
	*/
	//console.log("modal Open Called");
	
	if( $('#srchResult').is(':visible') ) {
			
				$('#srchResult').addClass('hide');
				$( '#srchResult').empty();
	}
	
		
	//if there is an opened contextMenu popup, remove it first.
	if( $('#divContextMenu').is(":visible") ){
		$('#divContextMenu').remove();
		$(document).find('.context-style').removeClass('context-style');
	} 
	
	
	//obj clicked is the "edit" button within the date cell user wants to edit
	//if there is any modal content, remove it
	//$("#modal").html('');
	//get user-requested content for the new modal

	
	//to prevent duplication after closing the modal, 
	//must know NOT ONLY the modalId of the date cell
	//but also the month and year of the cell.
	var $m = $(clickedObj).closest(".month");
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
	var cellDate = '<span class="cursive" style="float:right;font-size:17px;color:#8AC72D">' + numerMonth +'/'+ numerDate + '/' + numerYr + '</span>';
	    
	    

	
     $( modalContent ).clone(true, true).appendTo( "#modal" );	
	$("#modal").prepend(cellDate);
	
	$('.blocker').removeClass('hide');
	$('.blocker').css('opacity',0).animate({opacity: 1}, 10);	
	//required to run add listeners again to preserve the onclick editable events for lists
	addListenersToDom("false");
	
	
	
	
	
}

function modalClose(clickedObj)
{
	//obj clicked is a button withino the open #modal element
	//model el's content child has attr of 'modalid'.
	//that unique modalid is the same as the class name of the
	//original content wrapper.  so val = attr('modalid'); 
	//so original content wrapper in the DOM can be located as: '$(getElementsByClassName(val)).html()';
	
	//if contents of ul with attr modalid = (ex: 'd8') 
	//does not equal contents of the modal (i.e., modal contents edited by user),
	//then modalSave is called before close the modal window.
	
	
	$('#modal').find('li.context-style').first().removeClass('context-style');
	
	
	//don't allow a close of the modal if a context menu is open.
	if($("#divContextMenu").is(':visible')){
	  	 alert("Please FIRST close the Options Menu Popup, THEN close this Window.");
		return;
	
	   } else {
	
	
	
	
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
		   
		   
		   
	
		   
		   
		   
		   
		   		$( modalContent ).replaceWith( $( modalUL ).clone(true, true) );
		   	     addListenersToDom("false");
		   
		   		// add listeners afresh to the calendar target UL, modalContent:
		   		$(modalUL).siblings('.cursive').remove();
		   		$(modalUL).remove();
		  
				modalSource = '';
				$('.blocker').addClass('hide');
		   		
		   
		  

	
	   }// else
}


		
		// you could use set() which builds on the set only if it does not already exist.
		//$('#search').on('keyup',function(){
		$('#search').on('input',function(){
		   
			var searchTerm = $(this).val().toLowerCase();
			var results = [];
			var domObjs = [];
			//console.log('on input fired');
		   //require search terms of 3 chars or more
		   if(searchTerm.length > 2){ 
			//console.log('searchTerm len gtr than 2 fired');
		   $('li.lineEntry').each(function(i,list){
			  if(typeof list !== 'undefined'){
				  //console.log('LI is defined in .each');
			   	  var lineStr = $(this).text().toLowerCase().trim();
			  }
			   // -1 returned if searchTerm not found in LI string
			  if(lineStr.indexOf(searchTerm) === -1){
				  //$('#srchResult').empty(lineStr);
				// console.log('no le.');
				  
				 //$(this).hide();
				 // $('#srchResult').addClass('hide');
			  }else{	
				  //var nth = i+1;
				// console.log('Found a matche');
				  
				 // results.push(lineStr);
				  domObjs.push(list); //lineEntry Ojb with matched content
				  
				
				//  if(results.length>0){
					 // console.log('len is '.results.length);
					/*  results = results.map(function(el){
						  if( el.indexOf(searchTerm) > -1 ){
							//remove element from the array
							return el;
						  }
					  });	*/				  
				 // }			  
				  // add the matched str to the results array.
				 // results.push(lineStr);		
				  results.push(lineStr);
	
			  }	//else	   
		   }); //each
			
			// output to the view
			
			if(domObjs.length>0){	
				
				$('#srchResult').removeClass('hide');
				$( '#srchResult').empty(); //clear out displayed results with each on.input
				
				//Date: undefined: [object HTMLLIElement]<br/>
				
				var br =  document.createElement("br");			
				$(domObjs).each(function(i,res){					
					
					var thedate = $(res).parent('.edit').attr('modalid'); //e.g., d21 for the 21st date of a month.	
				  	
					if(typeof thedate !== 'undefined' && thedate.length > 1){
						thedate = thedate.replace('d', '');
				  		var month = $(res).closest('div.month').attr('ordinal');
						var yr = $(res).closest('div.month').attr('yr');
					  	thedate = month + "/" + thedate + "/" + yr;
					  	//console.log("found "+ searchTerm + " on " + thedate);
						//results[i] = thedate + ': ' + results[i];						
					} // if defined
					
					if( typeof res !== 'undefined'){ //  && $(res).html().indexOf(searchTerm) !== -1 					
						
						//$('#srchResult').append( "<div class='result"+i+"' >Date: " + thedate + ", " + $(res).html() ).append("</div><br/>");
						$("#srchResult").append( "<div style='cursor:pointer' class='result"+i+"'  >Date: " + thedate + ", " + $(res).html() + "</div>");
						
						
						
						$(document.body).find('.result'+i).on('click', function() {
								$(res).addClass('context-style');
   								//modalOpen($(res).closest('.modalImg'));
							modalOpen(res);
						});
						
						
						
						
						/*$('.result'+i).on("click", function(){	
							$(this).addclass('context-style');
							modalOpen($(res));
						});*/
					}
					
					
				});  // each results
				
			/*	// display the current results to the user
				$(domObjs).each(function(i,res){		
					if(typeof res !== 'undefined'){
						$('#srchResult').append( $(res).html() );	
					}
				});
				*/
				
				
				
			}//if domObjs has members
			else {
				$('#srchResult').addClass('hide');
			}	
			   
		   }//end if search term > 2
			else {
				$('#srchResult').removeClass('hide');
				$('#srchResult').html( '[ Search Requires 3+ Characters. ]' )
			}
				  			
		}); //on.input
		
		
		
		
		$('#srchResult').parent('form').on('focusout',function(){
			
			if( $('.blocker').hasClass('.hide') ){
				
				$('#srchResult').addClass('hide');
				$( '#srchResult').empty();
				
			} 
			
			
		});
	//tests whether obj is empty returns true if empty.
function onloadSetOverdueDisplay(){
	wait('start'); //spinner gif indicating busy
	var $overdues = $("#weeks").find("li.due");	
	wait('end'); 
	$.each($overdues, function(i, d){
		//  alert("overdue found");
		  //list this in the view of overdue jobs.
		 var jobNmbr = $(this).children('span').first().text(); //the job number parent span is always the first one in the LI.
		//alert("Job# is " + jobNmbr);
		//2. get the date of the edited job's UL wrapper's modalid.
			var date = $(this).parent('ul').attr('modalid').substr(1);
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

		//first erase all the content of the overdue job list in the view:
		$('#OverDueJobsList').html('');

		//write all the updated overdue jobs to the view:
		//by iterating through the overdueJobs properties:
		Object.keys(overdueJobs).forEach(function(key) {
			$('#OverDueJobsList').append(overdueJobs[key]);
		});		
		/*$('#OverDueJobsList').prepend('<p><span class="due" style="padding: 3px 8px !important; font-size: 18px">Overdue Jobs</span></p>');*/
	} else {
		// no overdueJobs to output to the calendar view.
		$('#OverDueJobsList').html('<p>Excellent! All WIPs are On-Schedule.</p>');
		
	}		
				
	
}

function isEmpty(obj) {
   
   //check if it's an Obj first
   var isObj = obj !== null 
   && typeof obj === 'object' 
   && Object.prototype.toString.call(obj) === '[object Object]';

   if (isObj) {
       //"var o", simply represents any property at all, no matter its name.
       for (var o in obj) {
           if (obj.hasOwnProperty(o)) {
			// this is not an empty object.
               return false;
               break;
           }
       }
       return true;
   } else {
       console.error("isEmpty function only accepts an Object");
   }
}

//build HTML display for icon checkboxes:
function renewTeamIconCheckboxDispaly()
{
	//construct company-specific icon assignment displays:
	//the jobAssignment(1, this) function requires an int value
	//sent to it from the Task Menu.
	teamIconsDisplay='<div class="row"><span style="padding-top:12px;float:left; clear:left">Assignment: &nbsp;</span>';
	$.each(iconAssignments[curCompany], function(k,v){
		// the k is the CSS class to use; the value is the label:
		
		if(null !== v){	
			if( parseInt(k,10) < 10 ){
			teamIconsDisplay += '<div class="iconrow">'+
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
			'<div class="box-label" id="l13"><li id="13" class="ic-users" '+
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
		'</i> Info Needed</li></div>'+
	'</div>'+
	'<div class="iconrow">'+					
		'<div class="box-label" id="l19"><li id="19" onclick="jobAssignment(\'inspr\', this)" option="inspr"><i class="ic-p-insp-req">'+
		'</i> Inspection Required</li></div>'+
	'</div>'+
	'<div class="iconrow">'+
		'<div class="box-label" id="l20"><li id="20" onclick="jobAssignment(\'inspa\', this)" option="inspa">'+
		'<i class="ic-p-insp-appr"></i> Inspection Approved</li></div>'+
	'</div>'+
	'<div class="iconrow">'+
		'<div class="box-label" id="l21"><li id="21" onclick="jobAssignment(\'pappr\', this)" option="pappr">'+
		'<i class="ic-p-appr"></i> Prmt Compl/Not Required</li></div>'+
	'</div></div>';
	$('#teams').html('');
	$('#teams').html(teamIconsDisplay);
	
}







	
	
	
