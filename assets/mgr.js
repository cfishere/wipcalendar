




//Admin and Mgr have their own bindList Funcs.
function  bindListeners4EachList(ULtags)
{
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
		
			$(posting).on("blur", function()  {
				$(parentUL).removeClass( "yellow-bg" ); 				
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
			'DennisH',
			'',
			'',
			'Install',
			'SubInstall',
			'CSC Transp',
			'Shipping',
			'Cust PU',
			' UPS', 
			' Unassigned',
			' Return Trip',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Completed',
			' Completed &amp; Invoiced',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required'
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
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4				
			];	
	
		
	} 
	else if(curCompany == "MarionOutdoor")
	{		
		
		
		assignLabels = [
			'ChadL',
			'CurtisS',			
			'DavidS',
			'',
			'Install', 
				'', 
			'Rec CSC Transp',
			'Rec Shipping',
			'Cust PU',
			' Rec UPS',
			' Unassigned',
			' Return Trip',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Completed',
			' Completed &amp; Invoiced',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required'				
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
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4				
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
			' Return Trip',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Completed',
			' Completed &amp; Invoiced',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required'
				
		
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
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4				
			];	
			
		
		
	}
	else if(curCompany == "Outdoor Images")
	{	
		assignLabels = [
			'ChadL',
			'',			
			'DavidS',
			'',
			'Install', 
				'', 
			'Rec CSC Transp',
			'Rec Shipping',
			'Cust PU',
			' Rec UPS',
			' Unassigned',
			' Return Trip',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Completed',
			' Completed &amp; Invoiced',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required'
			];
		
			teamAssignment = [
		
				li0 + 't1' + liCl +'1' + li1 + '1' +li2 + '1' + li3 + assignLabels[0] + li4,
				//li0 + 't2' + liCl +'2' + li1 + '2' +li2 + '2' + li3 + assignLabels[1] + li4,	
				'',
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
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4				
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
			' Return Trip',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Completed',
			' Completed &amp; Invoiced',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required'
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
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4				
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
			' Return Trip',
			' 2-Man',
			' 100ft Crane',
			' Part Needed',
			' Completed',
			' Completed &amp; Invoiced',
			' Info Needed',
			' Inspection Required',
			' Inspection Approved',						
			' Prmt Compl/Not Required'
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
				li0 + '21' + li1 + '\'pappr\'' + li2 + 'pappr' + li3 + '<i class="ic-p-appr"></i>' + assignLabels[20] + li4				
			];	
	
	}
	
	
	
	
	
	$(teamAssignment).each(function(i,team){
			
		i++;
		var l = $("#l"+i);
		var lpar = $(l).parent('div.iconrow');
		
		if( team !== '' ){
			//console.log(i + " will be a LIST")
			$(l).html(team);
			$(lpar).removeClass('hide');
			//$("#t"+(i-1)).html(team);
			//popup opt menu on r-clk of job entry	
		} else { 
			
			$(lpar).addClass('hide');
			
		}
		
	});
	
	
	
			
			
	
	
	var menuOptAssign = '';
	var menuOptJob = '';
	var menuOptPermt = '';
	
	//assignment menu with upto 9 options
	for($g=0; 10 >= $g; $g++){
		
		if(teamAssignment[$g] !== ''){
			menuOptAssign += teamAssignment[$g];
		}
	}
	
}
	

		
	/*	NEVER USED.	
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
		
	/*	//getUrlParams
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
	function removeUnassigned(opt){
			
		   $(editableLI).removeClass("unassigned");
		
		
			   //the span likely contains <i class="ic-flag"></i>
			   var flag = $(editableLI).find('i.ic-flag');
			   if(flag){
				   $.each(flag, function(){
					   
					   $(this).remove();
					   
				   });
			   	
			   }
		 
		return;
		
	}
		*/
		
	//'<div id="x"><button onclick="saveNote(this,'+listEl+')">Save</button><br><input type="textarea" id="y" value="" /></div>	
	// obj param references dom 'save button', from the above html.
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
		
		//general toggle show hide; param is the target DOM element
		
		function toggleVisibility(target){
			var $t = $(target)
			if( $t.hasClass( 'hide' ) ){
				$t.removeClass( "hide" );
			} else {
				$t.addClass( "hide" );
			}
			
		}
		
		
		
















