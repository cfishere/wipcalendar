
var emails = '<div id="copyToClipb">chris@customsigncenter.com;<br>christa@customsigncenter.com;<br>christina@customsigncenter.com;<br>dale@customsigncenter.com;<br>dan@customsigncenter.com;<br>debbie@customsigncenter.com;<br>ali@customsigncenter.com;<br>doug@customsigncenter.com;<br>james@customsigncenter.com;<br>jeff@customsigncenter.com;<br>kim@customsigncenter.com;<br>jreed@customsigncenter.com;<br>judy@customsigncenter.com;<br>marcus@customsigncenter.com;<br>mary@customsigncenter.com;<br>michael@customsigncenter.com;<br>rene@customsigncenter.com;<br>sam@customsigncenter.com;<br>scott@customsigncenter.com;<br>tturner@customsigncenter.com;<br>teryl@customsigncenter.com;<br>tim@customsigncenter.com</div>';


var isAdmin = true; //this is 'undefined' if only the common.js loads (ie. guest's view)
var dragEditing = "OFF";
var dragIconArray = [];
var contextMenu; //this is a mini html popup options menu for editing jobs	
var menuDisplay = '<div id="divContextMenu" style="display:none">'+ 
	'<input id="reschedule" type="text" placeholder="reschedule" />'+	
	'<div class="nav-container"><nav class="navbar"><ul id="ulContextMenu">'+	
	'<li id="t0" onclick="jobAssignment(0, this)" option="0" style="text-align:right;color:red">x Close</li>'; 


	/* for testing only var emailRecipientsCSC = ['info@signcreator.com','cf_is_here@hotmail.com','chris@customsigncenter.com','tim@customsigncenter.com']; */
	var emailRecipientsCSC = ['christa@customsigncenter.com','christina@customsigncenter.com','dale@customsigncenter.com','dan@customsigncenter.com','debbie@customsigncenter.com','ali@customsigncenter.com','doug@customsigncenter.com','eric@customsigncenter.com','james@customsigncenter.com','jeff@customsigncenter.com','kim@customsigncenter.com','jreed@customsigncenter.com','judy@customsigncenter.com','marcus@customsigncenter.com','mary@customsigncenter.com','michael@customsigncenter.com','rene@customsigncenter.com','sam@customsigncenter.com','scott@customsigncenter.com','tturner@customsigncenter.com','teryl@customsigncenter.com','tim@customsigncenter.com'];
	/**/


	//var modalLink = '<a class="modalLink" rel="modal:open"><img src="assets/write-circle-green-128.png" title="edit"</a>'*/
	// var liIndex; //hold the index position of the active list we're referencing in code.

$(document).ready(function ()
{
	/* MOVED HERE FROM COMMON.JS 
	$( '#reschedule' ).pickadate(
		{
			format: 'mm/dd/yyyy',
			formatSubmit: 'mm/dd/yyyy',
		}
	);
	*/

	var cols = document.querySelectorAll('.edit .lineEntry');
    //could try listElements that common.js has already created:
    [].forEach.call(cols, addDnDHandlers);
	
	var contextMenu = $('');

    var clipboard = new Clipboard('.copy',{
	  target: function(trigger) {
        	return trigger.nextElementSibling;
	    }		
	});

    clipboard.on('success', function(e) {
	   console.info('Action:', e.action);
	   console.info('Text:', e.text);
	   console.info('Trigger:', e.trigger);    
	   e.clearSelection();
    });
    
    clipboard.on('error', function(e) {
	   console.error('Action:', e.action);
	   console.error('Trigger:', e.trigger);
    });

    var inputArea = $('.edit > *');
	inputArea.on('keydown', function() {
		var key = event.keyCode || event.charCode;
		//allow backspace (key8) to NOT go back to previous web page, but instead delete backward
		//key46 is the delete key.
		if( key == 8 || key == 46 )
			return false; //prevents default browser/DOM behaviors for the specified keys.
	});
	
	/*disable back/forward page navigation of the browser*/
	history.pushState(null,null,document.title);
	window.addEventListener('popstate', function() {
		history.pushState(null, null, document.title);
	 });	
	
	$("#btnEmail").on("click", function(e) 
	{  
		e.preventDefault();	
		
		//open the email form where user can add a message, etc.
		formModalOpen();
	});
		
}); // doc ready.

/* open a form in a popup */
function formModalOpen()
{
	console.log('Open the form modal window.');
	$('#overlay').removeClass('hide');
}
/* open a form in a popup */
function formModalClose()
{
	$('#overlay').addClass('hide');
}


/*and return the user input to the caller func */

function userEmailInput()
{
	
	let formData = {};
	formData['fromEmail'] = $('#modalForm').find('input[name=fromEmail]').val();
	formData['message'] = $('#modalForm').find('textarea[name=message]').val();	
	//reset empty:
	$('#modalForm').find('input[name=formEmail]').val(null);	
	$('#modalForm').find('textarea[name=message]').val(null);	
	formModalClose();	
		/* DISABLE EMAIL FUNCTION - POST MSG ON SCREEN
		alert('Email Functions are Being Revised.  To email PDF, click PRINT button in the Calendar and change printer desitnation to "Save as PDF".  Attach PDF to your Outlook message, and paste in the recipients by clicking PREVIEW RECIPIENTS button in the calendar.');
		return;
		 */
		//cleanCalendarLayout() clones areas of the page needed for the pdf attachment.
		//appends all html segments to #print element.
		cleanCalendarLayout();
		wait('start'); //spinner gif indicating busy
		//set all UL DOM objs captured in clearCalendarLayout() to $editULs
		var $editULs = $("#print").find(".edit");	
		$( $editULs ).each(function(i, ulEl)
		{		 
			 if( $(ulEl).find('li').length < 1 )
			 {
				$(ulEl).parent('.date').attr('style', 'border:none');				
			 }		 
	 	});
 
	 	//add clearfix class to wrappers to hold floats on a single line.		
	 	var floatWraps = ['#headerDays','.calRow','#checkboxWrapper'];
	 
	 	$(floatWraps).each(function(i,el)
		{
			$('#print ' + el ).addClass("clearfix");
	 	});
		
		
		$("#print").find('img').remove();
		$("#print").find('span.addNewLine').remove();
		
		
		var calendarHTML = $("#print").html();	
		
		var data = {"recipients":emailRecipientsCSC,"company":curCompany,"calendar":calendarHTML,"formData":formData}; 
	
	    $.ajax({	
			url : "classes/sendemail.php",
			type: "POST",
			data : data,
			dataType:"json",
			success: function( respData, textStatus, jqXHR )
		  	{
				wait('end');
			 	//var msg = respData.msg;			
			 	giveNotice('<span style="color: #009000">Success</span>: Calendar has been Emailed to Your Recipients.');// with subject line: '+respData.subject);
			 	//reset the print div's html to empty for reuse.
			},
			error: function ( jqXHR, textStatus, errorThrown )
		  	{
			 	wait('end');
			 	giveNotice('<span style="color: #090000">Failed</span>: '+errorThrown+'.');
		  	}	
	    });	
	    $( "#print" ).html('');    
   
	if( typeof emails != 'undefined')
	{
		console.log('emails is defined.');
		$("#prevEmailPopUp").html(emails);
		$("#previewEmails").on("mouseover", function(e)
		{
			$("#prevEmailPopUp").removeClass("hide");
	    	$(this).html(' Click To Copy Emails to Clipboard');	    
   		});
   		$("#previewEmails").on("mouseout", function(e)
		{
	    	$("#prevEmailPopUp").addClass("hide");
	    	$(this).html('Preview Recipients');
   		});
	
	}
	
	
	/* MOVED HERE FROM COMMON.JS 
	 * assign current company task menu hmtl for the team names   
   	 */
	teamNamesHTML();
	
}


/* 
 * ASSIGN A STYLE, SUCH AS AN INSTALLER TEAM, or PERMIT ICON TO THE JOB CORRESPONDING TO THE CURRENT contextMenu Popup */
/* iconSet properties: 'ups','unassigned','trip','crew','crane,'part','comp,'inv','info','inspr','inspa,'pappr','prmt' 
 * var 'opt' holds the identifier of the menu item clicked in the contextMenu;
   The identifier (opt) can be a number where that number is reflected also in the css ID attr as t1,t2, etc. or 
   can be a word, such as 'ups'.  var 'obj' is the DOM OBJECT clicked from the MENU, passed in as the 'this' onclick keyword.
*/

function jobAssignment(opt, obj){
	//console.log("jobassignment called and opt is " + opt);
	wait('start');	
	
	// USER CLICKED MENU ITEM "OVERDUE"?
	if( opt === 21 ){
		//Toggle Class Existence
		if( $(editableLI).hasClass("due") ){
			unsetOverDueJob();			
		} else {
			setOverDueJob();			
		}
		//keep any other styling (team assignment, etc...), exit this function:
		wait('end');		
		return;
	}
	
	// USER CLICKED MENU ITEM "UNASSIGNED"?
	if(opt === 'unassigned'){
		if( $(editableLI).hasClass('unassigned') ){
			removeUnassigned();			
		} else {
			removeTeamAssignments();
			addUnassigned();			
		}		
		wait('end');
		return false;
	} else if( $(editableLI).hasClass('unassigned') && opt !== 0 ){
		removeUnassigned();
	}
	
	// USER CLICKED MENU ITEM "CLOSE MENU" [i.e., opt = 0]?
	if(opt === 0){
		
		//1st check to see if a reschedule data change had been made (i.e., move entry to new date cell if applicable)
		//hidden input inside the contextmenu wrapper div #divContextMenu used in the datepicker.
		//clicking a date stores that date to the value attribute of the checkNewEntryDate DOM element.
		//value="mm/dd/yyyy"
		var checkNewEntryDate = $("#divContextMenu").children("input[type='hidden']")[0];
		
		if(typeof checkNewEntryDate !== 'undefined' )
		{			
			//we need to move the entry to its new scheduled day
			//format is a string like mm/dd/yyyy
		     //console.log(checkNewEntryDate);
			var newDate = $(checkNewEntryDate).val();
			if(newDate.length > 5) //if the content is stored there.
			{
				
				// set the value back to empty?				
				$(obj).closest("#divContextMenu").children("input[type='hidden']").prop('value','')[0];
				//get LI's Job Entry HTML that we need to move to newDate's cell		
				
				 		 
				//$(contextMenu).remove();	
				// remove CSS marking the job as active for editing with the context menu:
				$(editableLI).removeClass('context-style');
				//tag it to use outerHTML
				//editableLI is the global LI DOM el that the context menu is trying to work with.
				var clonedLIhtml;
				
				   clonedLIhtml = $(editableLI).clone(true,true); //clone includes the <li> tag just like outerHTML does.
				   				 
				 			 
				//parse the date info
				 
				dateParts  = newDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
				//console.log("dateParts are: " + dateParts);
				// above outputs an array
				/*
				 [0] "07/30/2016"    
				 [1] "07"	
				 [2] "30"
				 [3] "2016"
				*/	
				rescheduleJob(dateParts,editableLI,clonedLIhtml);
			}
		    else
		    {
			    //before closing the menu, gotta set the contenteditable on the parent LI to 'false'.
			    
			    // close the style options menu
			   //console.log("remove contextmenu called");
			    $(contextMenu).remove();
			    $(editableLI).removeClass('context-style');
			    	
		    }
		}
		else
		{
			//console.log("Problem: checkNewEntryDate is undefined");
			// close the pop up menu
			$(contextMenu).remove();
			//$(editableLI).removeClass('context-style');
			//TODO: add a trigger to focus on the error message ctr at top of page
			giveNotice('<span style="color: #FF0000">Failed</span>: A problem was encountered trying to parse your date change request.');
		}
		     $(contextMenu).remove();
		//if($(editableLI).hasClass("context-style")){
			$(editableLI).removeClass("context-style");
		//}
		wait('end');
		return false;
		
	}
	
	//the LI id attr can help us select the correct team style & remove mutually-excl./conflicting styles.
	var CSSid; //the id of the task menu LI item that was clicked.	
	if( $(obj).attr('onclick')===true ){
		//then obj is a LI; some LI menu items have child <i> tags (icon-holders)
		CSSid = $(obj).attr("id"); //the id of the clicked menu item (e.g, t1, t2, etc.)
	}else{
		//this is an <i> icon tag within the LI; so get its parent id instead:
		CSSid = $(obj).closest('li').attr("id");		
	}	
	
	// USER CLICKED MENU ITEM "DELETE"?
	if( CSSid === 'delete' ) {		 
		 	var r = confirm("'OK', Permanently Delete this Entry? 'CANCEL' to stop deletion.");
		 	if (r == true) {
    			$(editableLI).remove();
			}
	}
	// USER CLICKED MENU ITEM "COMPLETED"?		
	if( CSSid === 'completed' ) {			 
		 $(editableLI).addClass( 'completed' );
		 if($(editableLI).hasClass("due")) {
			 $(editableLI).removeClass("due");
		 }
		wait('end');
		return false;
		 }
		 		
	// USER CLICKED MENU ITEM "COPY"?
	if ( CSSid === 'copy' ){
		
		//copy the job's contents for a paste operation using clipboard plugin.
		
		//get the read target (the clicked obj's job content) and set obj.attr to it "data-clipboard-target". 
		
		//use clone to get event handlers to allow adding unique admin notes or team assigns to each pasted job.
		
		if( $(obj).text() === "Copy This Job"){
			//copy to the clipboard, else paste
			$(obj).text("Insert Copied Job");
		
		     var JobLiClone = $(editableLI).clone(true);//includes LI, dont't want event handlers as they refer to the original job obj.	
			$(JobLiClone).removeClass('context-style');
			var span = $(JobLiClone).children('span').first();			
			$(span).removeAttr('id');//remove the id="job_10000"
			$(span).addClass( 'copyof' + $(span).text() ); //flag it with a class we can use to delete all jobs later.	
			
			// if we copy a copy, then [COPIED] gets duplicated each time. 
			// Check that there is no COPIED text, add if not.
			var ptrn =  /(?:\[CONT\.\])/g;
			if( ptrn.exec( $(span).text() ) === null  ){
				
				$(span).append(' [CONT.] ');
				
			}
			
			
			$("#hiddenClipboard").html('');
			$("#hiddenClipboard").html(JobLiClone);	
		
		//if more than one span, we prepend the 1st one, and append the others.
		} else {
			//paste the job
			$(obj).text("Copy This Job");
		     var LIST = $("#hiddenClipboard").children('li').first();
			var clonedLI = $(LIST).clone(true);		
			$(editableLI).closest('.edit').append(clonedLI);
			bindListeners4EachList( $(editableLI).closest('.edit') );
		}
		wait('end');
		return;		
	}//end 'copy' menu selection...
	
	
	 
	 // IV. A TEAM OPTION or OTHER OPTION SELECTED?
	 // user selected something other than "completed", "overdue", "delete" or "copy" 
	 // add and remove classes as needed from the target LI		   
	
		  //possible options for icons: 'ups','unasssigned','trip','crew','crane,'part','comp,'inv','info','inspr','inspa,'pappr', 'prmt'
		 var ico = false;
		 var removed = false;//did we remove the icon; initialize switch to false;
		 $.each(iconSet, function(ndex,icoClass){			 
			 if(opt === ndex){ 
				 //if the opt string maps to a named row within icoClass, 
				 //then mark var 'ico' switch to true, we completed a match:				 
				 ico = true;
				 //get <i> children; check <i> to learn if any has this icon class already:
				 
				//<LI> = editableLI; .icons = <SPAN>
				 var spanTag = $(editableLI).find('span').first();
				 var iTags = $(spanTag).children('i'); //1st level <i>'s in span, if any.
				 
				 $.each(iTags, function(nd,iTag){			 

					 //toggle 'remove' if selected icon class already assigned this job:
					 if( $(iTag).hasClass(icoClass) ){						 
						 $(iTag).remove();
						 //since we removed that icon, set var 'removed' to true:
						 removed = true;	
						 //exit function
						 wait('end');
						 return;
					 } 
				 });
				 //console.log('removed is equal to: '+removed);
				 if(removed !== true){
					 
					 if(opt === 'ups'){

						 if( $(editableLI).hasClass("t10") ){

							 $(editableLI).removeClass("t10");

						 } else {
							if( $(editableLI).hasClass("due") ) { 
								$(editableLI).attr("class", "lineEntry t10 due"); 
							} else {									
								$(editableLI).attr("class", "lineEntry t10"); 
							}								 
						 }
					 }


					 $newTag = '<i class="'+icoClass+'"></i>';
					 $(spanTag).prepend($newTag);					 
					 //console.log('Added the icon class: '+icoClass);
					 wait('end');
					 return;
				}
			 wait('end');
			 return;
		 }
			
		 });			
		if(ico !== true){
			removeTeamAssignments(CSSid);	
	 	}
	 
	wait('end');
}



function saveMonth(){	
	
	//Before saving to xml:
	// 1. and 2. below.
		
		
	//1. remove class 'hide' from all LI's so that state is not saved in xml
	teamsShowAll();	
	//2. remove any open admin note input forms and yellow edit classes.
	var yellowUL = $('#weeks').find(".yellow-bg");	
	$.each(yellowUL, function(){	
		
		$(this).removeClass('yellow-bg');
		
		var noteInput = $(this).find('#x');
		
		$.each(noteInput, function(tr, rt){
			  
			  $(rt).remove();	  
			  
		});		
	});
	
	var allContextCSS = $("#weeks").find('.context-style').removeClass('context-style');
	
	if(allContextCSS.length){
		$.each(allContextCSS, function(){
			
			$(this).removeClass('context-style');
			
		});
	}
	
	//if there is an open #divContextMenu, got to close it so it isn't saved into the xml.
	/*var $openMenus = $('.month').find('#divContextMenu');
	$($openMenus).each(function(i,menu){
		$(menu).remove();
	});*/
		
	wait('start');
	var htmlDataToSave = $("#weeks").html();
	var data={"content":htmlDataToSave, "year":year, "month":month, "theDate":theDate, "company":curCompany, "method":"saveMonth", "userID":userID, "coID":coID};
	
	//update the appropriate cell node in the xml
	$.ajax({	
		  url : "classes/calendar.php",
		  type: "POST",
		  data : data,
		  dataType:"json",
	   success: function(respData, textStatus, jqXHR)
	   {	
	   	  wait('end');
		  
		  giveNotice('<span style="color: #009000">Notice</span>: '+ respData.msg +'.');
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


/*
function addHoldStatus( yes, $obj ){
	
	// if yes == false, remove class 'hold' from $obj, else add 'hold' class.	 	
	 if( yes == false ) 
	 {
		 $($obj).removeClass('hold'); //remove 'hold' class bc now completed.
		 wait('end');
		 return;
	 } else {
		 
		 $($obj).addClass('hold');
		 wait('end');
		 return;
	 }
}
*/


//not used.  this adds a new list tag when enter key is pressed while in an edit UL.
function enterToAddNewLI(LIobj) {
	
		  //event handler if enter key pressed (key 13)
	  LIobj.keypress(function(e) {
		  $.each(e, function(){
			 if ( e.keyCode == 13 ) {  // detect the enter key
			 ev.preventDefault();
			 //need to create a new li pair for new entry.			 
			 var li = $(LIobj.add("li"));
			 li.attr("contenteditable","true");
			 li.addClass("lineEntry");			
		  } 
	  	 });
	  });	
	
}
/*
function endEdit(){
    	$( this ).attr("contenteditable","false");
    	$( this ).removeClass( "yellow-bg" );    
	
    	if( originalContent !== newContent ){ //was the cell content changed?
	    //save the originalContent so we can undo our 1 history update to the cell.
	    
	    lastEditedCell.push( $(this) );    
	   
	    //get the id of element with the year.
	    year = $( '#yr' ).attr('ordinal');
	    //get the id of element with the year.
	    month = $( this ).parent().attr('ordinal');
	    date = $( this ).parent().find('.date').val(); //get date
	   // update( content, year, month, date, curCompany, 'update' );
    	}
    	else { return false; }
}
*/

/*
  $(function() {
    $( "#message" ).dialog({
    modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
	   }
	 }
  });
  
*/




// called by the contextMenu option - "reschedule" current LI on click "Close" menu
// Designed to cut/paste the job to a new calendar date.  2 Params are moveToDate, jobHTML
// param1 is array:
/*
			[0] "07/30/2016"
			[1] "07"	...month
			[2] "30"  ...day
			[3] "2016" ...yr
*/
// Param2 is the original jquery DOM obj. This lets us remove it, once confirmed by user.
// Param3, jobHTML, is the LI html string:  '<li ....etc.... /li>' being moved.
//rescheduleJob(dateParts,editableLI,clonedLIhtml)
function rescheduleJob(moveToDate,$srcLI,jobHTML)
{
	//console.log("rescheduleJob called.");
	//must remove leading zero from the moveTo month and day (e.g., 07 to 7)
	if(moveToDate === null || moveToDate === '')
	{
		//console.log("moveToDate is null or empty...cannot complete rescheduling");
		return; //skip this whole plan... no date to move to	
	}//end if moveToDate is null		
	else
	{	
			/*moveToDate is array like:
				 [0] "07/30/2016"    
				 [1] "07"	
				 [2] "30"
				 [3] "2016"*/
	
	    $.each(moveToDate, function(i,v){
		    
		     /*moveToDate is array like:
				 [0] "7/30/2016"    
				 [1] "07"	
				 [2] "30"
				 [3] "2016"*/
		  if(i !== 0){ //skip the first string  
		    removeZeros=Number(v);
		  // console.log(v + ' converted by Number is now: ' + removeZeros);
		   /* console log outputs removeZeros like this for each v 
		    10/12/2016 converted by Number is now: NaN
		    /calendar/ (line 1112)
		    10 converted by Number is now: 10
		    /calendar/ (line 1112)
		    12 converted by Number is now: 12
		    /calendar/ (line 1112)
		    2016 converted by Number is now: 2016
		    /calendar/ (line 1112)
		    savetocell called
		    /calendar/ (line 1182)
		    found moveToDate month index 1 is: 10
		    /calendar/ (line 1193)
		    movetocell is: [object Object]
		    /calendar/ (line 1197)
		    jobHTML is [object Object]
		    */
		    
		    //back to a string and save		
		    moveToDate[i]=String(removeZeros);
		   //console.log('removeZeros, saved to moveToDate['+i+'] after conversion to str looks like: ' + moveToDate[i]);
		    /*
		    removeZeros, saved to moveToDate[3] after conversion to str looks like: 2016
		    /calendar/ (line 1140)
		    savetocell called
		    /calendar/ (line 1204)
		    found moveToDate month index 1 is: 10
		    /calendar/ (line 1215)
		    movetocell is: [object Object]
		    /calendar/ (line 1219)
		    jobHTML is [object Object]
*/
		/* moveToDate[1] is a str of the numeral month ( ie "10" if you are moving the entry to Oct ). */
		     }
	    });
	  
	    //1: Is current cal the yr and month we're moving the job to?
		    //if not, we need to load that year and month
	/*    if(year === moveToDate[3]) //current global year == the selected moved to date's year?
	    {	*/
		   
			    //the cur cal year is the moveTo location.
			    //get the moveTo cell as a DOM obj to append to:
			    //our identifier for the day can be the ID of the "+" image
			    //that is in the form of "d4" for 4th day of the month in the HTML DOM
			    saveToCell(moveToDate,jobHTML);
			    
			    //now remove the date that was in the datepicker input
			    $(contextMenu).children("#reschedule.picker__input").prop('value','');
			    $srcLI.remove();
			    //saveMonth();
			   addListenersToDom("false"); //ensure event handlers are added to the item's new location.	
	    
	}
	
}

// micro fn to process save request to a new date cell.
// called by rescheduleJob()
function saveToCell(moveToDate,jobHTML)
{
	/*
	console.log("SaveToCell called");
	console.log("The HTML being moved: "+jobHTML)
	console.log("d"+moveToDate[2]);
	*/
	//console.log("savetocell called");
	/*
	
	var monthToWrite = $("div.month[oridnal="+moveToDate[1]+"]");
	var dateToWrite = $(monthToWrite).find("ul[modalid=d"+moveToDate[2]+"]");
	$(dateToWrite).prepend(jobHTML);	
	
	*/
	$(".month").each(function(i,m){
		if( $(m).attr("ordinal") === String(moveToDate[1]) && $(m).attr("yr") === String(moveToDate[3]))
		{
			//we found the month to move to.
			//console.log("found moveToDate month as month nmbr: " + moveToDate[1]);
			//this is the month we need to reschedule on
			//var $dates = $(m).find(".date"); //all the date cells
			//var $moveToCell = $(m).find("ul[modalid=d"+moveToDate[2]+"]");
			var $moveToCell;
			if($moveToCell = $(m).find("ul[modalid=d"+moveToDate[2]+"]")){
			 // console.log("movetocell is: " + $($moveToCell).text());
			  //console.log("jobHTML is " + jobHTML);
			  /*movetocell is: [object Object]
			  jobHTML is [object Object]*/
			  $($moveToCell).prepend(jobHTML);	
			  return;
			}
		}
	});		
	
	
}

//Admin and Mgr have their own bindList Funcs.
function bindListeners4EachList(ULtags)
{
	console.log("bindlisteners4EachList called");
	//htmlReceivedFromXML = the html inside of div#weeks.  div.row are the top level elements
	//drill down to each list to bind handler
	//event handler for selecting installer team for new lists (right click)
	//console.log(htmlReceivedFromXML);
	var LItags = $(ULtags).children('.lineEntry');
	//var eachUL = $(eachWeekRow).children('ul.edit'); //each ul holding the list tags we need handlers on.
	var wrapper;
	var parentOffset;
	var parentWrapperOffset;
	$.each(LItags, function(i,posting)
	{	
		//each list requiring a handler		
		
			$(posting).on("contextmenu", function(e) 
			{				
				e.preventDefault();	
				console.log("Right Click on a List!");			
			    $(document).find('.context-style').removeClass('context-style');			
				$(posting).addClass("context-style");				
				editableLI = posting;
				
				//when switching company cals, seems we
				//need to set a delay, so that the #reschedule DOM
				//object is available to set the pickadate.
				setTimeout( function()
				{  
					$( '#reschedule' ).pickadate(
						{
							format: 'mm/dd/yyyy',
							formatSubmit: 'mm/dd/yyyy',
						}
					);
				}, 800 );				
				
				var relX, distX;
				
				if( $("#modal").is(":visible") )
				{
					console.log('if( $("#modal").is(":visible") ) is true');
					//use the ul.edit as the reference for positioning popup menu					
					wrapper = $("#modal");
					var off = $(wrapper).offset(); //offset of wrapper
					//parentWrapperOffset = off.right + 300;
					relX = parseInt(wrapper.scrollLeft() + $(wrapper).outerWidth());
				} 
				else 
				{	
					console.log('a $("#modal") is not currently visible.');				
					wrapper = $(this).closest(".date"); //The date box	
					console.log('this closest date is '+wrapper);			 
					var off = $("#weeks").offset(); //offset of wrapper of the parent (i.e., #weeks)
					//parentWrapperOffset = off.left;
					relX = parseInt(wrapper.scrollLeft() + wrapper.outerWidth());
				}				
				
				 //parentOffset = $(wrapper).offset();  //date's parent-div's left/top offset from dom window				

				 // need relative position of the current day div
				 // compared to the top-left of the #weeks container.
				 // the resulting value of datePosition - #weeks position 
				 // will help to place the contextmenu left of right
				 // so as to avoid being directly over top of the active date cell.
				 
				var relY = wrapper.scrollTop();
				 // px left distance betw/ weeks wrapper & user's date cell
				
				// distX = parentOffset.right - parentWrapperOffset; 

				 // px top distance betw/ weeks wrapper & user's date cell
				 // var distY = parentOffset.top - parentWrapperOffset.top;			

				// if( distX >= 330 ){
					 //show the popup menu to the right
					 
				// } else  {
					 //show the popup to the right
				//	relX = parseInt(wrapper.scrollLeft() -  wrapper.outerWidth());
				//	console.log(relX +" and relY " + relY);
				// }		
				console.log('ready to append the contextMenu, it is: '+contextMenu);
				//* do not show a modal popup if this is a weekview modal popup:
				if( $('#modal').hasClass('weekView')  ){
					alert("Editing is currently disable while viewing a week in the popup window; try editing directly from the calendar or use a single day popup window.");
					return;
				}
				
				 $(wrapper).append( $( contextMenu ).css({
					left: relX,
					top: relY,
					display: 'inherit'
				 }));										
		 }); //right click event was registered.	
	}); //each LItags, add event handler
}//bindListeners4EachList func

//admin and mgr vers are diff: admin adds the teams to the context menu.
function teamNamesHTML()
{	
	console.log('teamNamesHtml called');
	menuDisplay = '<div id="divContextMenu" style="display:none">'+ 
	'<input id="reschedule" type="text" placeholder="reschedule" />'+	
	'<div class="nav-container"><nav class="navbar"><ul id="ulContextMenu">'+	
	'<li id="t0" onclick="jobAssignment(0, this)" option="0" style="text-align:right;color:red">x Close</li>'; 
	
	var li0 = '<li id="';
	var liCl = '" Class="';
	var li1 = '" onclick="jobAssignment(';
	var li2 = ', this)" option="';
	var li3 = '">';
	var li4 = '</li>';
	//let teamAssignment = new Object();
	
	
		//BUILD ASSIGNMENT SUBMENU OF CONTEXT MENU for curCompany:
		menuDisplay += '<li style="padding:12px 5px;color:#000000">ASSIGN<ul>';
		
		$.each(iconAssignments[curCompany], function(k,v){
			// the k is the CSS class to use; the value is the label:
			// less than 10 property names are like: "1":"RobertC"
			if(null !== v){	
				if( parseInt(k,10) < 10 ){
					menuDisplay += li0 + 't'+ k + liCl + k + li1 + k +li2 + k + li3 + v + li4;
				} else {
					//this needs to have an icon displayed with the html:
					//v = 'ic- class name/number for t10, select-10, etc'
					var val = v.split("/");				
					/*ups example: "10":"UPS/ic-ups" k:v
					  val[0] = 'UPS'; val[1] = 'ic-ups'; k = 10				
					*/
					menuDisplay += '<li id="'+val[1]+'" class="t'+k+'" onclick="jobAssignment(\''+
						val[0].toLowerCase()+'\', this)" option="'+
						val[0].toLowerCase()+'">&nbsp;<i class="'+val[1]+'"></i> '+val[0]+'</li>';
				}
			}		
		});
		
		//WRAP UP THE FIRST SUBMENU:
		menuDisplay += '<li id="due" class="due" onclick="jobAssignment(21, this)" option="21">Overdue</li></ul></li>';
		
		//BUILD ON THE OTHER SUB MENUS:
			/////// STATUS SUBMENU
		menuDisplay += '<li style="padding:12px 5px"><span style="color:#236FBF">STATUS</span><ul><li id="ic-i-ret-trip" onclick="jobAssignment(\'trip\', this)" option="trip"><i class="ic-i-ret-trip"></i> Service</li><li id="13" class="ic-users" onclick="jobAssignment(\'crew\', this)" option="crew"> 2-Man</li><li id="14" onclick="jobAssignment(\'crane\', this)" option="crane"><i class="ic-i-crane"></i> 100ft Crane</li><li id="15" class="ic-cog" onclick="jobAssignment(\'parts\', this)" option="parts"> Part Needed</li><li id="16" onclick="jobAssignment(\'comp\', this)" option="comp"><i class="ic-i-comp-alt"></i> Ready to Invoice</li><li id="17" onclick="jobAssignment(\'inv\', this)" option="inv"><i class="ic-i-comp-inv"></i> Collect</li></ul></li>';
		
			/////// PERMIT SUBMENU
		menuDisplay += '<li style="padding:12px 5px"><span style="color:#007F16">PERMIT</span><ul style="color:#007F16"><li id="18" onclick="jobAssignment(\'info\', this)" option="info"><i class="ic-p-inf"></i> Need Info</li><li id="19" onclick="jobAssignment(\'inspr\', this)" option="inspr"><i class="ic-p-insp-req"></i> Insp. Req\'ed</li><li id="20" onclick="jobAssignment(\'inspa\', this)" option="inspa"><i class="ic-p-insp-appr"></i> Insp. Appr\'d</li><li id="21" onclick="jobAssignment(\'pappr\', this)" option="pappr"><i class="ic-p-appr"></i> Done/Not Needed</li><li id="22" onclick="jobAssignment(\'prmt\', this)" option="prmt"><i class="ic-asterisk"></i> Prmt Only</li></ul></li>';
		
		
		
		//WRAP UP THE MENU WITH TOP LEVEL MENU ITEMS BELOW THE SUBMENUS:
		menuDisplay += '<li id="copy" data-clipboard-target="" data-clipboard-action="copy" '+
						'onclick="jobAssignment(13, this)" class="copy" option="copy">Copy This Job</li>'+
						'<li style="padding:12px 5px" id="delete" class="delete" '+
						'onclick="jobAssignment(11, this)" option="11">Delete Entry</li>'+
						'</ul></nav></div></div>';
		
		
		
		
		
		
		contextMenu = $(menuDisplay);
		
		
		
	
}	

	
	//admin only func: Toggle OFF unsassigned Styling for a job
	function removeUnassigned(){
		//overdue jobs can still have assigned statuses:		
		$(editableLI).removeClass("unassigned");
		var icon = $(editableLI).find('i.ic-flag').first();
		$(icon).remove();
		console.log("removeUnassigned and ico flag called.");		 
		return;		
	}
 	//add unassigned: Toggle ON unsassigned Styling for a job
	function addUnassigned(){
		$(editableLI).addClass("unassigned");
		$(editableLI).find('span').first().prepend('<i class="ic-flag"></i>');
		return;		
	}
	//remove all team assignment styles from a job
	function removeTeamAssignments(CSSid){			
		 console.log("CSSid's id value is "+CSSid);
		 //global boxIDs = ['t0','t1','t2','t3','t4','t5','t6','t7','t8','t9','t10']
		 if('t0' !== CSSid){ //not an 'exit menu' click.
			 $(boxIDs).each(function(i,box) {			 
				// if the ignostic array item === the select option & the target LI doesn't contain that class...
				// box is iterations for classes t0, t1, t2, .... CSS team styling Classes
				if( box === CSSid && $(editableLI).hasClass( CSSid ) === false ) {	
					 console.log("box is: " +box+ " and the selected id is: "	+ CSSid); 				 	
					 $(editableLI).addClass( box );
					// $(editableLI).prepend($icon);
					 //if user is setting unassigned as the class
					 //ensure completed cannot remain as a class
					 if(CSSid == 'unassigned'){
						 console.log("removing class 'completed' if it is assigned to this job");
						 //cannot be both unassigned and completed :
						 $(editableLI).removeClass( 'completed' );
					 }
				}
				else if(box !== CSSid )
				{	//console.log("Remove a class: box is: " +box+ " and the selected id is: "	+ CSSid);
					//if($(targetList[0]).hasClass(CSSid))
					//{
						// CAN ONLY have one 'STATUS' assignment per job (.t1-.t10), so remove classes that don't match the user's selected style:

						$(editableLI).removeClass( box );
						//console.log( "Removed class " + box );
					//}
				}
			 });	
		 }	
		return;
	}
		
		
	//2 functions: set and unset overdue jobs.
//over due jobs are contained in the glob obj "overdueJobs"
//and accessed by keys named after each overdue job number
//overdueJobs.jobnumber
function setOverDueJob(){
	//alert("Set this as overdue");
	$(editableLI).addClass("due");
	$(editableLI).removeClass('context-style');
	$(editableLI).addClass("t21");
	//add this job to the global obj 'overdueJobs':
	//1. get the job # of current edited job in dom
		var jobNmbr = $(editableLI).children('span').first().text(); //the job number parent span is always the first one in the LI.
	//alert("Job# is " + jobNmbr);
	//2. get the date of the edited job's UL wrapper's modalid.
		var date = $(editableLI).parent('ul').attr('modalid').substr(1);
	//3. trim off the first char ('d') from the modalid value, leaving just the numeral.
		//date = date.substr(1);
	     var mo = $( "span#mo" ).attr('ordinal');
		var yr = $( "span#yr" ).attr('ordinal');
		date = '<span style="color: red">'+ mo + '/' + date + '/' + yr+'</span>';
	//get the job desc text and truncate it to the first 30 chars.
		var desc = $(editableLI).text();
		desc = desc.slice(0,30);
	//concat into a line of text to save as a property of overdueJobs obj.
		var info = '<div class="ovrDue" id="'+jobNmbr+'">' + date +': '+ desc +'...</div>';
	if( overdueJobs.hasOwnProperty(jobNmbr) === false ){
		overdueJobs[jobNmbr] = info;
	}

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
		$('#OverDueJobsList').html('<p>Excellent! All WIPs are On-Schedule.</p>');
	}			
				
}

function unsetOverDueJob(){
	//alert("UnSet this as overdue");
	//called when user assigns a job "overdue";
	$(editableLI).removeClass("due");
	$(editableLI).removeClass("t21"); //this class is used in checkbox controls to hide/show entry
	$(editableLI).addClass('context-style');
	//remove this job from the global obj 'overdueJobs'
	//1. get the job # of current edited job in dom
		var jobNmbr = $(editableLI).children('span').first().text(); //the job number parent span is always the first one in the LI.
	//2. delete that property
		delete overdueJobs[jobNmbr]; 
	//3. Delete the job from the overdue display in the DOM.
		$("#"+jobNmbr).remove();	
	
}

function rearrangeJobs(moveIcon)
{
	"use strict";
	var $UL = $(moveIcon).closest("#modal").children("ul.edit")[0];	
	
	//initialize sortable if not already initialized:	
	$( $UL ).sortable();
	
	//collect child LIs	
	var $li = $($UL).children('li');	
	console.log("rearrangeJobs called. DragEditing is set to "+dragEditing);
	
	//Is Drag Editing On or Turned Off?
	if( dragEditing === "OFF"){		
		dragEditing = "ON";		
		$( $UL ).sortable("option", "disabled", false);
    	$( $UL ).disableSelection();		
		var icon = '<img class="dragIcon dragImg" src="http://customsigncenter.com/calendar/dev/assets/dragicon.png" />';
		$($li).each(function(){
			//add drag icons to each LI:
			$(this).prepend(icon);
			//$( $(this).first(".dragIcon") ).draggable({axis:"y", containment: $UL});
		});
		
	} else {
		dragEditing = "OFF";
		$( $UL ).sortable("destroy"); 
		$( $UL ).removeClass("ui-sortable-disabled");
		$( $UL ).removeClass("ui-sortable");
		//console.log("dragEditing was set to: " + dragEditing);				
		dragIconArray = [];
		// this gets keys of all jQuery LI objs in calendar: var oLen = Object.keys(listElements);
		// Using Modal Now, Only need to get LI from that Modal's UL:
		
		
		//remove icons from LIs and sortable classes
		$($li).each(function(){
			//remove the sortable class from each LI if present:
			$( this ).removeClass("ui-sortable-handle");
			//remove the drag icon imgs from each LI:
			var $childDragImg = $( this ).children(".dragIcon")[0];
			if($childDragImg){
				$childDragImg.remove();				
				//console.log("Tried to remove List number "+v);
			}
			
		});
		
		
		//remove icons from LIs
		/*
		if($li.length>0){
			$($li).each(function(){
				$(this).first(".dragIcon").remove();			
			});
		}
		*/
	}
}

function saveNote(obj){
		var r = $(obj).siblings('input#y').val();
		var LI = $(obj).closest('.lineEntry');
	 // $(listEl).attr("contenteditable", "false");
	//	$(this).on('mouseleave', function (){  

		    //$(inputArea).unbind('dblclick');		 
		    var user = $usr.slice(0,3);
		    
		    var notes = ' [<i style="color:#f00">' + user + '</i>]: ' + r;			
		    if( notes.length > 35 ){		
				
				$(obj).parent('#x').replaceWith('<br><span class="admin-note">'+notes+'</span>');
				
			} else {
				
				$(obj).parent('#x').remove();
				
			}			

		  /*  if(notes.length > 9){				    
			    $(listEl).append('<span class="admin-note">'+notes+'</span>');
		    }
		    
			$(listEl).unbind('mouseleave');
			
	   }); 		  
*/



		closeEditing(LI);


	}
function addNewLine(elem, parentClass){	
			
	if(typeof isAdmin !== 'undefined')
	{		
					
		var newList = $("<li contenteditable='false' class='lineEntry unassigned newEntry' title='Right Click for Options'><span id='admin-note' contenteditable='false'>&gt;</span></li>");		
		//the ul 
		var ulTarget = $(elem).parents(parentClass).children('.edit');
		$(ulTarget).append(newList);
		var newEntry = $(ulTarget).children(".newEntry")
		
		//addEventListenerToOne(newEntry);

		//pass this new LI obj to the func that creates the evt handler for it.	
		
			bindListeners4EachList(ulTarget);	
			$(newEntry).removeClass("newEntry");
	}
}


  


function startEdit(e) {
	//e.stopPropagation();
	
	 //the first two lines create a new li when you click in a cell. REMOVE: Only Create New Job Entries with the "+" btn.
	 /* 
	 	var btn =  $( this ).parents('.date').children('.day').children('.addNewLine');
	   	addNewLine(btn);   
	 */
	   	   
	  //$( this ).attr("contenteditable","true");
	  
	  //this refers to the .edit UL, which holds the LI's of job entries

	 var thisUL = $(this).closest(".edit"); //siblings if you want all the LIs in the UL
	 originalContent = $( this ).html(); //get the content of the cell before editing it (contenteditable = true) 
	 
	  //Make UL editable
	/* $(this).each(function(index,element){	
	 		
	 	
		//alert(originalContent);
		$(element).attr("contenteditable", "true");		  
	  });
	 */
	 
	   $( this ).addClass( "yellow-bg" );
		//make any existing children (lists) editable
		  $(thisUL).children("li").each(function(ct,listEl){
			
		     var inputArea;
			  
			  
			  
			 	  
		   $(this).on('click', function(){
			   	
				   inputArea = $(listEl).append('<div id="x"><button onclick="saveNote(this)">Save</button><br><input type="textarea" id="y" value="" /></div>');
				   //inputArea = $('#x');
				   $(inputArea).focus(); //set cursor	
			        $(listEl).unbind('click');
			    
		    });			  
		
		

		    //$(listEl).children("span").attr("contenteditable", "false");		
		    // add mouseout set editing false handler here:
		    //	
	    });
	   
}

// called by func start edit.  Param is a LI element set as editable.
// set a handler mouseout to stop editing.
function closeEditing( LIst ){
	
	var parentUL = $(LIst).closest(".edit");
	
	 $( parentUL ).on('mouseout', function(evt) {
		// $domObj refers to the UL of class .edit.
		//foreach edit node <li> that is empty, remove them...
		//addListenersToDom();
		//evt.stopImmediatePropagation();
		
		//$('li.lineEntry:empty').remove();
		//var listTags = $(domObj).children('li');
		//remove any hidden contextMenus, default New Job Lists, and br tags		
		//$(listTags).each(function() {
			/*
			if($(li).text() === '! New Job'){
				$(li).remove();
			}
			*/
			//remove editable attrib				  
		  	 //$(LIst).prop("contenteditable", "false"); 
		      $(LIst).removeAttr("contenteditable");
		       $(parentUL).removeClass( "yellow-bg" ); 
			//remove all break tags.
			$(LIst).find('br').remove();
	
			 
	//	});
		
	
		
		newContent = $(parentUL).html(); //get the newly added cell contents; ContentEditable = false	
		if( originalContent !== newContent ){
			lastEditedCell.push( $(parentUL) );
			//console.log("Orig is: "+originalContent);
			//console.log("New is: "+newContent);
			//get the id of element with the year.
			//year = $( '#yr' ).attr('ordinal');
			//get the id of element with the year.
			//month = $( domObj ).parent().attr('ordinal') -1;
			//date = $( domObj ).parent().find('.date').val(); //get date
		} 
		//else for debugging only
		else {
			//No Changes to Save. 
			//$( domObj ).html('');
		}
		$(parentUL).off( 'mouseout' );
	   });   
	
}

/* We used to track user edits and allow un-/re-do
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
		

