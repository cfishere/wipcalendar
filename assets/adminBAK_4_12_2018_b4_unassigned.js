









$(document).ready(function (){
	
	var contextMenu = $('<div id="divContextMenu" style="display:none">'+ 
	'<input id="reschedule" type="text" placeholder="reschedule" />'+	
	'<div class="nav-container"><div class="nav"><ul id="ulContextMenu">'+	
	    '<li id="t0" onclick="jobAssignment(0, this)" option="0" style="text-align:right;color:red">x Close</li>'+
	    '<li>ASSIGN<ul><li id="t1" onclick="jobAssignment(1, this)" option="1">Team 1</li>'+
	    '<li id="t2" onclick="jobAssignment(2, this)" option="2">Team 2</li>'+
	    '<li id="t3" onclick="jobAssignment(3, this)" option="3">Team 3</li>'+
	    '<li id="t4" onclick="jobAssignment(4, this)" option="4">Team 4</li>'+
	    '<li id="t5" onclick="jobAssignment(5, this)" option="5">Team 5</li>'+
	    '<li id="t6" onclick="jobAssignment(6, this)" option="6">Team 6</li>'+
	    '<li id="t7" onclick="jobAssignment(7, this)" option="7">Team 7</li>'+
	    '<li id="t8" onclick="jobAssignment(8, this)" option="8">Team 8</li>'+
	    '<li id="hold" class="hold_small" onclick="jobAssignment(12, this)" option="12">On Hold</li>'+
	    '<li id="unassigned" class="unassigned" onclick="jobAssignment(9, this)" option="9">Unassigned</li>'+
	    '<li id="completed" class="completed" style="font-weight:normal" onclick="jobAssignment(10, this)" option="10">In/Complete</li>'+	 
		'</ul></li>'+
		'<li id="copy" data-clipboard-target="" data-clipboard-action="copy" onclick="jobAssignment(13, this)" option="copy">Copy This Job</li>'+
	    '<li id="delete" class="delete" onclick="jobAssignment(11, this)" option="11">Delete Entry</li>'+
	'</ul></div></div></div>');


	
	
	
	
	   var clipboard = new Clipboard('.copy',{
	  target: function(trigger) {        	
		  if( trigger.hasAttribute('data-clipboard-target')){				  
			  return trigger.nextElementSibling;
		  } else {			  
			  trigger.text('Insert Copied Job');
			  trigger.className = "paste";			  
			  //return the text content of the LI element that is subject to the opened Actions Menu.
			  return editableLI;
		  }
		  
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
}); // doc ready.
/*
//admin only func
function contextMenuHandler(newList){	
	console.log("contextMenuHandler called.");
			
			//event handler for selecting installer team for new lists (right click)
			$(newList).on("contextmenu", function(e) {	
			   
			     e.preventDefault();
				
				$(document).find('.context-style').removeClass('context-style');
				
			
				 var wrapper;
				 var parentWrapperOffset;

				 if($("#modal").is(":visible")){
					 //use the ul.edit as the reference for positioning popup menu
					 //console.log("Modal is visible");
					 wrapper = $("#modal");
					 parentWrapperOffset = 100;
				 } else {
					 //console.log("Modal is NOT visible");
					 wrapper = $(newList).closest('.date'); //The date box
					 parentWrapperOffset = $(newList).closest("#weeks").offset(); //offset of wrapper of the parent (i.e., #weeks)
				 }				

				 var parentOffset = wrapper.offset();  //date's parent-div's left/top offset from dom window
				
				 var relX, distX;
				 var relY =  wrapper.scrollTop();
				 // px left distance betw/ weeks wrapper & user's date cell
				 distX = parentOffset.left - parentWrapperOffset.left; 
				 // px top distance betw/ weeks wrapper & user's date cell
				// var distY = parentOffset.top - parentWrapperOffset.top;

				 //console.log("parentWrapperoffset is " + parentWrapperOffset.left+". parentOffset is " + parentOffset.left);



				 //if( distX >= 250 ){
					 //show the popup menu to the left
					 relX = wrapper.scrollLeft() - $("#divContextMenu").outerWidth +30;
				// } else  {
					 //show the popup to the right
				//	 relX = wrapper.scrollLeft() +  wrapper.outerWidth();
				// }		

				
				$(wrapper).append($(contextMenu).css({
					left: relX,
					top: relY,
					display: 'inherit'
				 }));								
                   		
				
				setTimeout(function(){  
					 $( '#reschedule' ).pickadate(
						{
							format: 'mm/dd/yyyy',
							formatSubmit: 'mm/dd/yyyy',
						}
					);
				 }, 3000);		
		  						
		 });	
		 
	
	
}
*/

/* ASSIGN A STYLE, SUCH AS AN INSTALLER TEAM, or PERMIT ICON TO THE JOB CORRESPONDING TO THE CURRENT contextMenu Popup */
/* iconSet properties: 'ups','unas','trip','crew','crane,'part','comp,'inv','info','inspr','inspa,'pappr' */
/* option is the numeric index location of LI clicked in contextMenu, obj is the LI DOM object clicked from the MENU */
function jobAssignment(opt, obj){
	console.log("jobassignment called");
	wait('start');
	
	/* old version
	if( opt === 21 ){
		
		if( $(editableLI).hasClass("due") ){			
			$(editableLI).removeClass("due");
			$(editableLI).removeClass("t21"); //this class is used in checkbox controls to hide/show entry
			$(editableLI).addClass('context-style');
		} else {
			$(editableLI).addClass("due");
			$(editableLI).removeClass('context-style');
			$(editableLI).addClass("t21");
		}
		//keep any other styling (team assignment, etc...), so return now.
		wait('end');
		return;
	}
	*/
	if( $(editableLI).hasClass('unassigned') ){	
				  
			   $(editableLI).find('.ic-flag').first().remove();
			   $(editableLI).removeClass("unassigned");
			   //console.log("removeUnassigned and ico flag called.");    
					   
		   
	} /*else { //toggle assignment; remove all classes and add 'unassigned':
		$(editableLI).attr('class', '');
		$(editableLI).addClass('lineEntry unassigned');		
	}*/
	
	if( opt === 21 ){
		//alert("Option to change overdue status chosen.");
		if( $(editableLI).hasClass("due") ){
			unsetOverDueJob();			
		} else {
			setOverDueJob();			
		}
		//keep any other styling (team assignment, etc...), so return now.
		wait('end');
		return;
	}
	
	
	//some new option was selected, so clean LI assignment classes if this action is an assignment:
	if( parseInt(opt) >= 1 && parseInt(opt) <= 8){		
		//remove all assignment CSS classes set in LI:
		if( $(editableLI).hasClass("due") ){
			$(editableLI).attr("class", "lineEntry due");
		} else {
			
			$(editableLI).attr("class", "lineEntry");
		}
	}	
	
	//0 = close menu window	
	if(opt == '0'){
		
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
		
		
	}
	
	//var editableLI = $(obj).parents('li.lineEntry');	//the list we want to style or act upon
	
	 //was the option style an inclusive or preclusive class
	 //i.e., does the li element have a class styles that we would want to add a class with, or one we would want to supplant completely?
	 
	 // I. COMPLETED OPTION SELECTED?
	 // id="completed" already present on the LI, *AND* the user 
	 // selected "completed" option ( then remove the id to 'toggle off', and mark as incomplete ).
	 
/*    No More "Completed" status.  Simply Remove from Calendar.  See: III., Below
	 if( $(obj).attr("id") === 'completed' ) 
	 {	
	 	// 1st, if hold class present, let's remove its, as 'hold' and 'completed' are mutually inclusive
	 	// add or remove class 'hold'.  args(false = remove, obj to remove it from)
	 	if( $(editableLI).hasClass('hold') ) addHoldStatus(false, editableLI);		 

		if( $(editableLI).hasClass('completed') === false )
		{			
			$(editableLI).addClass('completed');			
			return;
		}	
	 }
	 */
	 // II. HOLD OPTION SELECTED?
	 if( $(obj).attr("id") === 'hold' ) //user clicked 'On Hold' opt
	 {		
		// alert('You selected ID hold');
		if( $(editableLI).hasClass('hold') === false )
		{		
			addHoldStatus(true, editableLI);			
		}	
		else 
		{
			addHoldStatus(false, editableLI);							 
		}
	 }
	 // III. DELETE OR JOB COMPLETED OPTION SELECTED?
	 else if( $(obj).attr("id") === 'delete' || $(obj).attr("id") === 'completed')
	 {
		 if($(obj).attr("id") === 'delete'){
		 	var r = confirm("'OK', Permanently Delete this Entry? 'CANCEL' to stop deletion.");
		 	if (r == true) {
    				$(editableLI).remove();
			}
		 } else {
			 
			 $(editableLI).addClass( 'completed' );
			 if($(editableLI).hasClass("due")) {$(editableLI).removeClass("due");}
		 }
		 		
	 }
	
	else if ( $(obj).attr("id") === 'copy' ){
		
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
			return;
		}
		
		
		
		
		
		
	}
	
	
	 
	 // IV. A TEAM OPTION or OTHER OPTION SELECTED?
	 // user selected something other than "completed" or "delete" or "On Hold" 
	 // add and remove classes as needed from the target LI		   
	 else 
	 {
		  //possible options for icons: 'ups','unas','trip','crew','crane,'part','comp,'inv','info','inspr','inspa,'pappr'
		 var ico = '';
		 var removed = '';
		 $.each(iconSet, function(ndex,icoClass){
			 
			 if(opt === ndex){
				 
				 ico = true;
				 //get <i> children; check if any has the icon class already:
				 
				//<LI> = editableLI; .icons = <SPAN>
				 var spanTag = $(editableLI).find('span').first();
				 var iTags = $(spanTag).children('i'); //1st level <i>'s in span, if any.
				 
				 $.each(iTags, function(nd,iTag){			 

					 //toggle 'remove' if selected icon class already assigned this job:
					 if( $(iTag).hasClass(icoClass) ){
						 
						 $(iTag).remove();
						 removed = true;
						 return;

					 } 
				 });
				 
					 if(removed !== true){
						 //ready to add an icon.
						 //some icons need additional classes placed in the parent LI (e.g., unassigned)
						 
						 if(opt === 'unas'){
							 if( $(editableLI).hasClass("unassigned")){								 
								 
								 $(editableLI).removeClass("unassigned");
								 
							 } else {
								if( $(editableLI).hasClass("due") ) { 
									$(editableLI).attr("class", "lineEntry unassigned due");
								} else {
							 		$(editableLI).attr("class", "lineEntry unassigned"); 
								}
								 
							 }
						 }
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
						 //console.log('Added the icon class')
						 return;
				 	}
				 
				return;
			 }
			
		 });
		 
			
		if(ico !== true){
		 
 		var CSSid = $(obj).attr("id"); //the id of the clicked menu item (e.g, t1, t2, etc.)
			console.log("CSSid is "+CSSid);
			//global boxIDs = ['t0','t1','t2','t3','t4','t5','t6','t7','t8','t9','t10']
		 if('t0' !== CSSid){ //not an 'exit menu' click.
		 $(boxIDs).each(function(i,box) {			 
			// if the ignostic array item === the select option & the target LI doesn't contain that class...
			// box is iterations for classes t0, t1, t2, .... CSS team styling Classes
			if( box === CSSid && $(editableLI).hasClass( CSSid ) === false ) {	
				// console.log("box is: " +box+ " and the selected id is: "	+ CSSid); 				 	
				 $(editableLI).addClass( box );
				// $(editableLI).prepend($icon);
				 //if user is setting unassigned as the class
				 //ensure completed cannot remain as a class
				 if(CSSid == 'unassigned'){
					 $(editableLI).removeClass( 'completed' );
				 }
			}
			else if(box !== CSSid )
			{	//console.log("Remove a class: box is: " +box+ " and the selected id is: "	+ CSSid);
				//if($(targetList[0]).hasClass(CSSid))
				//{
					// CAN ONLY have one 'STATUS' assignment per job (.t1-.t10), so remove classes that don't match the user's selected style:
					$(editableLI).removeClass( box );
					console.log( "Removed class " + box );
				
				
				//}
			}
		 });	
	 }
	 }
	 }
	
	wait('end');
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

function startEdit(e) {
	e.stopPropagation();
	
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
			//remove all break tags.
			$(LIst).find('br').remove();
	
			 
	//	});
		
		//$( domObj ).attr("contenteditable","false");
		 if( $(parentUL).hasClass("yellow-bg")){
    			$(parentUL).removeClass( "yellow-bg" );  
		 }
		//any li tags not empty, add them to the newContent var.
		
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
function  bindListeners4EachList(ULtags)
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
	$.each(LItags, function(i,posting){	
		//each list requiring a handler			
			$(posting).on("contextmenu", function(e) {
				
				 e.preventDefault();		 	
			      $(document).find('.context-style').removeClass('context-style');
				
				 $(posting).addClass("context-style");
				
				 editableLI = posting;
				
				//when switching companu cals, seems we
				//need to set a delay, so that the #reschedule DOM
				//object is available to set the pickadate.
				setTimeout(function(){  
					 $( '#reschedule' ).pickadate(
						{
							format: 'mm/dd/yyyy',
							formatSubmit: 'mm/dd/yyyy',
						}
					);
				 }, 1000);	
				
				
				var relX, distX;
				
				 if( $("#modal").is(":visible") ){
					 //use the ul.edit as the reference for positioning popup menu					
					 wrapper = $("#modal");
					 var off = $(wrapper).offset(); //offset of wrapper
					 //parentWrapperOffset = off.right + 300;
					 relX = parseInt(wrapper.scrollLeft() + $(wrapper).outerWidth());
				 } else {					
					 wrapper = $(this).closest(".date"); //The date box					 
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

				 $(wrapper).append($(contextMenu).css({
					left: relX,
					top: relY,
					display: 'inherit'
				 }));										
		 });	
	});

}

//admin and mgr vers are diff: admin adds the teams to the context menu.
function teamNamesHTML()
{	
	
	
	var li0 = '<li id="';
	var liCl = '" Class="';
	var li1 = '" onclick="jobAssignment(';
	var li2 = ', this)" option="';
	var li3 = '">';
	var li4 = '</li>';
	
	
	if(curCompany == "Custom Sign Center")
	{	
		
		assignLabels = [
			'RobertC',
			'Sign Dr',
			'',
			'',
			'Install',
			'SubInstall',
			'CSC Transp',
			'Shipping',
			'Cust PU',
			' UPS', 
			' Unassigned',			
			' Service',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Ready to Invoice',
			' Collect',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required',
			'Overdue'
		];	
		
		teamAssignment = [
		
				li0 + 't1' + liCl +'1' + li1 + '1' +li2 + '1' + li3 + assignLabels[0] + li4,
		
				/*'<div class="tooltip">Bob-Michael<span class="tooltiptext">Contact Info Can Be Displayed Here!</span></div></li>',*/
		
				li0 + 't2' + liCl +'2' + li1 + '2' +li2 + '2' + li3 + assignLabels[1] + li4,		
				'',
				'',				
				li0 + 't5' + liCl +'5' + li1 + '5' +li2 + '5' + li3 + assignLabels[4] + li4,
				li0 + 't6' + liCl +'6' + li1 + '6' +li2 + '6' + li3 + assignLabels[5] + li4,
				li0 + 't7' + liCl +'7' + li1 + '7' +li2 + '7' + li3 + assignLabels[6] + li4,
				li0 + 't8' + liCl +'8' + li1 + '8' +li2 + '8' + li3 + assignLabels[7] + li4,
				li0 + 't9' + liCl +'9' + li1 + '9' +li2 + '9' + li3 + assignLabels[8] + li4,
			
				// iconmoon elements
				li0 + 'ic-ups' + liCl +'na' + li1 + '\'ups\'' +li2 + 'ups' + li3 + '<i class="ic-ups"></i>' + assignLabels[9] + li4,			
				li0 + 'unassigned' + liCl + 'unassigned' +  li1 + '\'unas\'' +li2 + 'unas' + li3 + '<i class="ic-flag"></i>' + assignLabels[10] + li4,
			
				
			
				li0 + 'ic-i-ret-trip' + li1 + '\'trip\'' + li2 + 'trip' + li3 + '<i class="ic-i-ret-trip"></i>' + assignLabels[11] + li4,
				li0 + '13' + liCl + 'ic-users' + li1 + '\'crew\'' + li2 + 'crew' + li3 + assignLabels[12] + li4,
				li0 + '14' + li1 + '\'crane\'' + li2 + 'crane' + li3 + '<i class="ic-i-crane"></i>' + assignLabels[13] + li4,
				li0 + '15' + liCl + 'ic-cog' + li1 + '\'parts\'' + li2 + 'parts' + li3 + assignLabels[14] + li4,
				li0 + '16' + li1 + '\'comp\'' + li2 + 'comp' + li3 + '<i class="ic-i-comp-alt"></i>' + assignLabels[15] + li4,
				li0 + '17' + li1 + '\'inv\'' + li2 + 'inv' + li3 + '<i class="ic-i-comp-inv"></i>' + assignLabels[16] + li4,
				li0 + '18' + li1 + '\'info\'' + li2 + 'info' + li3 + '<i class="ic-p-inf"></i>' + assignLabels[17] + li4,			
				li0 + '19' + li1 + '\'inspr\'' + li2 + 'inspr' + li3 + '<i class="ic-p-insp-req"></i>' + assignLabels[18] + li4,
				li0 + '20' + li1 + '\'inspa\'' + li2 + 'inspa' + li3 + '<i class="ic-p-insp-appr"></i>' + assignLabels[19] + li4,
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4,			
				//css style only, no icon for Overdue (class .due)
				li0 + 'due' + liCl +'due' + li1 + '21' +li2 + '21' + li3 + assignLabels[21] + li4
			];	
	
		
	} 
	
	else if(curCompany == "Marion Signs")
	{		
		
			assignLabels = [
				
			'ChadL',
			'CurtisS',			
			'DavidS',
			'',//team reserved
			'Install', //unassigned
				'', //subinstall
			'Rec CSC Transp',
			'Rec Shipping',
			'Cust PU',
			' Rec UPS',
			' Unassigned',
			' Service',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Ready to Invoice',
			' Collect',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required',
			'Overdue'
				
		
		];
		
		teamAssignment = [
				li0 + 't1' + liCl +'1' + li1 + '1' +li2 + '1' + li3 + assignLabels[0] + li4,
				li0 + 't2' + liCl +'2' + li1 + '2' +li2 + '2' + li3 + assignLabels[1] + li4,	
				
				li0 + 't3' + liCl +'3' + li1 + '3' +li2 + '3' + li3 + assignLabels[2] + li4,		
				//li0 + 't4' + liCl +'4' + li1 + '4' +li2 + '4' + li3 + assignLabels[3] + li4,	
				'',
				li0 + 't5' + liCl +'5' + li1 + '5' +li2 + '5' + li3 + assignLabels[4] + li4,				
			
				//li0 + 't6' + liCl +'6' + li1 + '6' +li2 + '6' + li3 + assignLabels[5] + li4,
				'',
				li0 + 't7' + liCl +'7' + li1 + '7' +li2 + '7' + li3 + assignLabels[6] + li4,
				li0 + 't8' + liCl +'8' + li1 + '8' +li2 + '8' + li3 + assignLabels[7] + li4,
				li0 + 't9' + liCl +'9' + li1 + '9' +li2 + '9' + li3 + assignLabels[8] + li4,
				// iconmoon elements
				li0 + 'ic-ups' + liCl +'t5' + li1 + '\'ups\'' +li2 + 'ups' + li3 + '<i class="ic-ups"></i>' + assignLabels[9] + li4,			
				li0 + 'unassigned' + liCl + 'unassigned' +  li1 + '\'unas\'' +li2 + 'unas' + li3 + '<i class="ic-flag"></i>' + assignLabels[10] + li4,
				li0 + 'ic-i-ret-trip' + li1 + '\'trip\'' + li2 + 'trip' + li3 + '<i class="ic-i-ret-trip"></i>' + assignLabels[11] + li4,
				li0 + '13' + liCl + 'ic-users' + li1 + '\'crew\'' + li2 + 'crew' + li3 + assignLabels[12] + li4,
				li0 + '14' + li1 + '\'crane\'' + li2 + 'crane' + li3 + '<i class="ic-i-crane"></i>' + assignLabels[13] + li4,
				li0 + '15' + liCl + 'ic-cog' + li1 + '\'parts\'' + li2 + 'parts' + li3 + assignLabels[14] + li4,
				li0 + '16' + li1 + '\'comp\'' + li2 + 'comp' + li3 + '<i class="ic-i-comp-alt"></i>' + assignLabels[15] + li4,
				li0 + '17' + li1 + '\'inv\'' + li2 + 'inv' + li3 + '<i class="ic-i-comp-inv"></i>' + assignLabels[16] + li4,
				li0 + '18' + li1 + '\'info\'' + li2 + 'info' + li3 + '<i class="ic-p-inf"></i>' + assignLabels[17] + li4,			
				li0 + '19' + li1 + '\'inspr\'' + li2 + 'inspr' + li3 + '<i class="ic-p-insp-req"></i>' + assignLabels[18] + li4,
				li0 + '20' + li1 + '\'inspa\'' + li2 + 'inspa' + li3 + '<i class="ic-p-insp-appr"></i>' + assignLabels[19] + li4,
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4,
			//css style only, no icon for Overdue (class .due)
				li0 + 'due' + liCl +'due' + li1 + '21' +li2 + '21' + li3 + assignLabels[21] + li4
			];	
			
		
		
	}
	else if(curCompany == "Outdoor Images")
	{		
		assignLabels = [
			'Chad',
			'Marvin',			
			'Shawn',
			'',
			'Install',			
				'', 
			'Rec CSC Transp',
			'Rec Shipping',
			'Cust PU',
			' Rec UPS',
			' Unassigned',
			' Service',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Ready to Invoice',
			' Collect',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required',
			'Overdue'
			];
		
			teamAssignment = [
		
				li0 + 't1' + liCl +'1' + li1 + '1' +li2 + '1' + li3 + assignLabels[0] + li4,
				li0 + 't2' + liCl +'2' + li1 + '2' +li2 + '2' + li3 + assignLabels[1] + li4,	
				
				li0 + 't3' + liCl +'3' + li1 + '3' +li2 + '3' + li3 + assignLabels[2] + li4,		
				//li0 + 't4' + liCl +'4' + li1 + '4' +li2 + '4' + li3 + assignLabels[3] + li4,	
				'',
				li0 + 't5' + liCl +'5' + li1 + '5' +li2 + '5' + li3 + assignLabels[4] + li4,				
			
				//li0 + 't6' + liCl +'6' + li1 + '6' +li2 + '6' + li3 + assignLabels[5] + li4,
				'',
				li0 + 't7' + liCl +'7' + li1 + '7' +li2 + '7' + li3 + assignLabels[6] + li4,
				li0 + 't8' + liCl +'8' + li1 + '8' +li2 + '8' + li3 + assignLabels[7] + li4,
				li0 + 't9' + liCl +'9' + li1 + '9' +li2 + '9' + li3 + assignLabels[8] + li4,
				// iconmoon elements
				li0 + 'ic-ups' +  li1 + '\'ups\'' +li2 + 'ups' + li3 + '<i class="ic-ups"></i>' + assignLabels[9] + li4,			
				li0 + 'unassigned' + liCl + 'unassigned' +  li1 + '\'unas\'' +li2 + 'unas' + li3 + '<i class="ic-flag"></i>' + assignLabels[10] + li4,
				li0 + 'ic-i-ret-trip' + li1 + '\'trip\'' + li2 + 'trip' + li3 + '<i class="ic-i-ret-trip"></i>' + assignLabels[11] + li4,
				li0 + '13' + liCl + 'ic-users' + li1 + '\'crew\'' + li2 + 'crew' + li3 + assignLabels[12] + li4,
				li0 + '14' + li1 + '\'crane\'' + li2 + 'crane' + li3 + '<i class="ic-i-crane"></i>' + assignLabels[13] + li4,
				li0 + '15' + liCl + 'ic-cog' + li1 + '\'parts\'' + li2 + 'parts' + li3 + assignLabels[14] + li4,
				li0 + '16' + li1 + '\'comp\'' + li2 + 'comp' + li3 + '<i class="ic-i-comp-alt"></i>' + assignLabels[15] + li4,
				li0 + '17' + li1 + '\'inv\'' + li2 + 'inv' + li3 + '<i class="ic-i-comp-inv"></i>' + assignLabels[16] + li4,
				li0 + '18' + li1 + '\'info\'' + li2 + 'info' + li3 + '<i class="ic-p-inf"></i>' + assignLabels[17] + li4,			
				li0 + '19' + li1 + '\'inspr\'' + li2 + 'inspr' + li3 + '<i class="ic-p-insp-req"></i>' + assignLabels[18] + li4,
				li0 + '20' + li1 + '\'inspa\'' + li2 + 'inspa' + li3 + '<i class="ic-p-insp-appr"></i>' + assignLabels[19] + li4,
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4,	
				//css style only, no icon for Overdue (class .due)
				li0 + 'due' + liCl +'due' + li1 + '21' +li2 + '21' + li3 + assignLabels[21] + li4
			];	
	
	} else if(curCompany == "JG Signs")
	{	
		assignLabels = [
			'',
			'',			
			'',
			'',
			'Install', 
				'', 
			'Rec CSC Transp',
			'Rec Shipping',
			'Cust PU',
			' Rec UPS',
			' Unassigned',
			' Service',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Ready to Invoice',
			' Collect',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required',
			'Overdue'
			];
		
			teamAssignment = [
		
				//li0 + 't1' + liCl +'1' + li1 + '1' +li2 + '1' + li3 + assignLabels[0] + li4,
				'',
				//li0 + 't2' + liCl +'2' + li1 + '2' +li2 + '2' + li3 + assignLabels[1] + li4,	
				'',
				//li0 + 't3' + liCl +'3' + li1 + '3' +li2 + '3' + li3 + assignLabels[2] + li4,	
				'',
				//li0 + 't4' + liCl +'4' + li1 + '4' +li2 + '4' + li3 + assignLabels[3] + li4,	
				'',
				li0 + 't5' + liCl +'5' + li1 + '5' +li2 + '5' + li3 + assignLabels[4] + li4,				
			
				//li0 + 't6' + liCl +'6' + li1 + '6' +li2 + '6' + li3 + assignLabels[5] + li4,
				'',
				li0 + 't7' + liCl +'7' + li1 + '7' +li2 + '7' + li3 + assignLabels[6] + li4,
				li0 + 't8' + liCl +'8' + li1 + '8' +li2 + '8' + li3 + assignLabels[7] + li4,
				li0 + 't9' + liCl +'9' + li1 + '9' +li2 + '9' + li3 + assignLabels[8] + li4,
				// iconmoon elements
				li0 + 'ic-ups' +  li1 + '\'ups\'' +li2 + 'ups' + li3 + '<i class="ic-ups"></i>' + assignLabels[9] + li4,			
				li0 + 'unassigned' + liCl + 'unassigned' +  li1 + '\'unas\'' +li2 + 'unas' + li3 + '<i class="ic-flag"></i>' + assignLabels[10] + li4,
				li0 + 'ic-i-ret-trip' + li1 + '\'trip\'' + li2 + 'trip' + li3 + '<i class="ic-i-ret-trip"></i>' + assignLabels[11] + li4,
				li0 + '13' + liCl + 'ic-users' + li1 + '\'crew\'' + li2 + 'crew' + li3 + assignLabels[12] + li4,
				li0 + '14' + li1 + '\'crane\'' + li2 + 'crane' + li3 + '<i class="ic-i-crane"></i>' + assignLabels[13] + li4,
				li0 + '15' + liCl + 'ic-cog' + li1 + '\'parts\'' + li2 + 'parts' + li3 + assignLabels[14] + li4,
				li0 + '16' + li1 + '\'comp\'' + li2 + 'comp' + li3 + '<i class="ic-i-comp-alt"></i>' + assignLabels[15] + li4,
				li0 + '17' + li1 + '\'inv\'' + li2 + 'inv' + li3 + '<i class="ic-i-comp-inv"></i>' + assignLabels[16] + li4,
				li0 + '18' + li1 + '\'info\'' + li2 + 'info' + li3 + '<i class="ic-p-inf"></i>' + assignLabels[17] + li4,			
				li0 + '19' + li1 + '\'inspr\'' + li2 + 'inspr' + li3 + '<i class="ic-p-insp-req"></i>' + assignLabels[18] + li4,
				li0 + '20' + li1 + '\'inspa\'' + li2 + 'inspa' + li3 + '<i class="ic-p-insp-appr"></i>' + assignLabels[19] + li4,
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4,
				//css style only, no icon for Overdue (class .due)
				li0 + 'due' + liCl +'due' + li1 + '21' +li2 + '21' + li3 + assignLabels[21] + li4
			];	
	
	}
	else if(curCompany == "Boyer Signs")
	{	
		assignLabels = [
			'',
			'',			
			'',
			'',
			'Install', 
				'', 
			'Rec CSC Transp',
			'Rec Shipping',
			'Cust PU',
			' Rec UPS',
			' Unassigned',
			' Service',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Ready to Invoice',
			' Collect',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required',
			'Overdue'
			];
		
			teamAssignment = [
		
				
				//li0 + 't1' + liCl +'1' + li1 + '1' +li2 + '1' + li3 + assignLabels[0] + li4,
				'',
				//li0 + 't2' + liCl +'2' + li1 + '2' +li2 + '2' + li3 + assignLabels[1] + li4,	
				'',
				//li0 + 't3' + liCl +'3' + li1 + '3' +li2 + '3' + li3 + assignLabels[2] + li4,	
				'',
				//li0 + 't4' + liCl +'4' + li1 + '4' +li2 + '4' + li3 + assignLabels[3] + li4,	
				'',
				li0 + 't5' + liCl +'5' + li1 + '5' +li2 + '5' + li3 + assignLabels[4] + li4,				
			
				//li0 + 't6' + liCl +'6' + li1 + '6' +li2 + '6' + li3 + assignLabels[5] + li4,
				'',
				li0 + 't7' + liCl +'7' + li1 + '7' +li2 + '7' + li3 + assignLabels[6] + li4,
				li0 + 't8' + liCl +'8' + li1 + '8' +li2 + '8' + li3 + assignLabels[7] + li4,
				li0 + 't9' + liCl +'9' + li1 + '9' +li2 + '9' + li3 + assignLabels[8] + li4,
				// iconmoon elements
				li0 + 'ic-ups' +  li1 + '\'ups\'' +li2 + 'ups' + li3 + '<i class="ic-ups"></i>' + assignLabels[9] + li4,			
				li0 + 'unassigned' + liCl + 'unassigned' +  li1 + '\'unas\'' +li2 + 'unas' + li3 + '<i class="ic-flag"></i>' + assignLabels[10] + li4,
				li0 + 'ic-i-ret-trip' + li1 + '\'trip\'' + li2 + 'trip' + li3 + '<i class="ic-i-ret-trip"></i>' + assignLabels[11] + li4,
				li0 + '13' + liCl + 'ic-users' + li1 + '\'crew\'' + li2 + 'crew' + li3 + assignLabels[12] + li4,
				li0 + '14' + li1 + '\'crane\'' + li2 + 'crane' + li3 + '<i class="ic-i-crane"></i>' + assignLabels[13] + li4,
				li0 + '15' + liCl + 'ic-cog' + li1 + '\'parts\'' + li2 + 'parts' + li3 + assignLabels[14] + li4,
				li0 + '16' + li1 + '\'comp\'' + li2 + 'comp' + li3 + '<i class="ic-i-comp-alt"></i>' + assignLabels[15] + li4,
				li0 + '17' + li1 + '\'inv\'' + li2 + 'inv' + li3 + '<i class="ic-i-comp-inv"></i>' + assignLabels[16] + li4,
				li0 + '18' + li1 + '\'info\'' + li2 + 'info' + li3 + '<i class="ic-p-inf"></i>' + assignLabels[17] + li4,			
				li0 + '19' + li1 + '\'inspr\'' + li2 + 'inspr' + li3 + '<i class="ic-p-insp-req"></i>' + assignLabels[18] + li4,
				li0 + '20' + li1 + '\'inspa\'' + li2 + 'inspa' + li3 + '<i class="ic-p-insp-appr"></i>' + assignLabels[19] + li4,
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4,
				//css style only, no icon for Overdue (class .due)
				li0 + 'due' + liCl +'due' + li1 + '21' +li2 + '21' + li3 + assignLabels[21] + li4
			];	
	
	}
	
	
	
	
	
	$(teamAssignment).each(function(i,team){
			
		i++;
		var l = $("#l"+i);
		var lpar = $(l).parent('div.iconrow');
		
		if( team !== '' && team !== 'Overdue' ){
			//console.log(i + " will be a LIST")
			$(l).html(team);
			$(lpar).removeClass('hide');
			//$("#t"+(i-1)).html(team);
			//popup opt menu on r-clk of job entry	
		} else if( team == 'Overdue' ) { 
			$("#l21").parent('div.iconrow').removeClass('hide');
			$("#l21").html(team);
			i--;
			//alert("menu item is overdue and the iterator is " +i);
		
			
		} else {
			
			$(lpar).addClass('hide');
			
		}
		
	});
	
	
	
			
			
	
	
	var menuOptAssign = '';
	var menuOptJob = '';
	var menuOptPermt = '';
	
	//assignment menu with up to 12 options
	for($g=0; 11 >= $g; $g++){
		
		if(teamAssignment[$g] !== '' && $g !== 11){
			menuOptAssign += teamAssignment[$g];
		}
		else if($g == 11){
			//this would be the 1st item in the STATUS submenu, but needs to be Overdue item.
			menuOptAssign += teamAssignment[21];
		}
	}
	
	
	
	
	
	contextMenu = $('<div id="divContextMenu" style="display:none">'+ 
	'<input id="reschedule" type="text" placeholder="reschedule" />'+	
	'<div class="nav-container"><nav class="navbar"><ul id="ulContextMenu">'+	
	    '<li id="t0" onclick="jobAssignment(0, this)" option="0" style="text-align:right;color:red">x Close</li>'+
	    '<li style="padding:12px 5px;color:#000000">ASSIGN<ul>'+	    
		menuOptAssign +
	    '</ul></li>'+
	    '<li style="padding:12px 5px"><span style="color:#236FBF">STATUS</span><ul>'+    
	    teamAssignment[11]+	
	    teamAssignment[12]+
	    teamAssignment[13]+	     
	    teamAssignment[14]+
         teamAssignment[15]+
	    teamAssignment[16]+ //completed invoiced	    
	    '</ul></li>'+
	    '<li style="padding:12px 5px"><span style="color:#007F16">PERMIT</span><ul style="color:#007F16">'+    
	    teamAssignment[17]+
	    teamAssignment[18]+
	    teamAssignment[19]+
	    teamAssignment[20]+
	    '</ul></li>'+
				 '<li id="copy" data-clipboard-target="" data-clipboard-action="copy" onclick="jobAssignment(13, this)" class="copy" option="copy">Copy This Job</li>'+
	    '<li style="padding:12px 5px" id="delete" class="delete" onclick="jobAssignment(11, this)" option="11">Delete Entry</li>'+
	'</ul></nav></div>');
	
}	

	
	//admin only func	
	function removeUnassigned(opt,obj){
			
		$(editableLI).removeClass("unassigned");
		$(obj).remove(".ic-flag");
		//console.log("removeUnassigned and ico flag called.");		 
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
		

