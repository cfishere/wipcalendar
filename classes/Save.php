<?php
libxml_use_internal_errors(true);

class Save
{
	public $pdoDB; //db connection	
	public $content;
	public $init;

	/* flow:
	Converting HTML to XML tree to saveMonth()
	 HTML comes as "content" in the request array.
	 SEE BELOW.
	 
	 Convert html string into domdocument to access its tags, attributes, etc.
	 Get node matching the :
	 1. ( Company's Calendar: not implemented yet )
	 2. Get XMLnode matching the Year of the request: $this->year == xml year attribute "ordinal"
	 3. Get the $this->year's XMLnode matching the month of the request: $this->month == xml month attribute "ordinal"
	 WE NOW HAVE THE MONTH NODE TO UPDATE FOR THE REQUEST.
	 
	 4. Foreach div with attribute "ordinal" (these are the cells of the month), (the count of each cell for the month) :
	 	foreach 
			set the XML nodeValue to == the HTML nodeValue;
	 */
	
	function __construct()
	{
		$this->init = new Init;
		 
	}
	 
	// Convert the above into the XML structure needed to update the xml file.
	function month() 
	{		
		/* Check that user possess the access_token to perform this action */		
		
		$query = 'SELECT COUNT(id) FROM `active_token` WHERE `id_user` = :userID AND `coid_token` = :coID';
		$statement = $this->init->pdoDB->prepare($query);
		$statement->bindParam(':userID', $_POST['userID']);
		$statement->bindParam(':coID', $_POST['coID']);
		if( $statement->execute() ) 
		{			
			$row = $statement->fetch(PDO::FETCH_ASSOC);
			if( $row["COUNT(id)"] < 1 ) 
			{
				//user does NOT have the access_token permission to save at this time.
				$msg = array('msg'=>"Not Saved.  Another user with save rights is currently logged in.");
				$msg = json_encode($msg);
				exit($msg);
			} 
			else 
			{		
				// THIS USER HAS THE ACCESS_TOKEN -> AUTHORIZED TO SAVE THE CALENDAR.
				// Convert HTML to be saved ( POST[content] ) into DomDocument.
			    $this->init->content = stripslashes($this->init->content); // remove escaping backslashes, if any
			    $htmlDoc = new DOMDocument();		
			    $htmlDoc->loadHtml($this->init->content);
			    //free some memory:
			    unset($this->init->content);
			    /* set the domdoc node contents into an array such that:
			    // array[12][4][100100] is the html contents for job 100100, which should be saved to the 
			    // xml doc at node December 4th for the current iteration year we are in.
			    // it will be saved in a <job> node with attrib 'number' equal to 100100.
			    */
			    $xmlToSaveArray = array();				
			    $tempArray = array();
			    //search html object tree ....
			    //$htmlSearchDiv = $htmlDoc->getElementsByTagName("div");
				for($z=0; $div = $htmlDoc->getElementsByTagName("div")->item($z); $z++) 
				{				    

					/*// DEBUG: Examine the Contents of the Current Div.
					 $v = html_entity_decode(json_encode($div ->nodeValue));
					//*/

					/* TODO: 	Getting the Month Ordinal Value below MUST be done within 
							a FOREACH YR Node Ordinal Value.  Otherwise, there will 
							be, e.g., the possibility of more than 1 month with an 
							ordinal of, say, 2 (feb) & identical content would probably 
							save to both Feb 2017 and Feb 2018.

							UNTIL ADDRESSED, best to have not more than 12 months total 
							within an xml structure.
					*/

					/* TODO:  look for substring 'month' in class attrib, to achieve 
							greater stability against future class attrib modifications.
					*/

						if( $div->getAttribute( "class" ) == "month" || $div->getAttribute( "class" ) == "month hide" ) 
						{
							//exit('A div found having a class of "month" or "month hid"');
							
							/* 8-24-2018 Solution: cannot have duplicate key names 'admin-note'*/
							$adminNoteSuffix = 0; //iterate+append this to our jobNmbr's of admin-note
						
							
						   $monthOrd = ( integer )$div->getAttribute( "ordinal" ); //this number will be utilized 
						   // as the index value in the html content array, to map htmldoc month node 
						   //contents to a matching xml mo. node.	
						   $yearOrd = ( integer )$div->getAttribute( "yr" );
						   // Here, $div is a month div to iterate into & extract LI contents, to store in an array, 
						   // then persist the stored array values into the company's xml doc;
						   for( $d=0; $dateDiv = $div->getElementsByTagName( "div" )->item( $d ); $d++ ) 
						   { 
						   		//echo '<br>Div node found within the div.month node;  div node index value is: '.$d;
							    //for each date div within the current month $div
							    if( $dateDiv->getAttribute( "class" ) == "date" || $dateDiv->getAttribute( "class" ) == "date today" ) 
							    {

								    $ord = ( integer )$dateDiv->getAttribute( "ordinal" );
								    //echo 'Found date dive with ordinal of '.$ord;
								    //we have a date cell with potentially new content
								    //$debugMsg .= $z . " - we have a date cell with potentially new content - ";
								    //drill down to this div's child ul of class="edit" for its content.
								    // echo json_encode(addslashes($div ->nodeValue));
								    for( $i=0; $childUL = $dateDiv->getElementsByTagName( "ul" )->item( $i ); $i++ ) 
								    {
										// $debugMsg .= "\r\n"; 
										// $debugMsg .= " -we have the child UL for the date cell \r\n"; 
										if( $childUL->getAttribute( "class" ) == "edit" ) 
										{	
											/*exit('if $childUL->getAttribute( "class" ) == "edit" is true for $dateDiv ordinal '.
											$ord.'. And yearOrd is: '.$yearOrd.',while monthOrd is: '.$monthOrd );*/							  	
											$xmlToSaveArray[ $yearOrd ][ $monthOrd ][ $ord ] = array();			  
											// what if we want to save an empty value (no <li> tags)?
											if( $childUL->getElementsByTagName( "li" )->length > 0 ) 
											{
												foreach( $childUL->getElementsByTagName( "li" ) as $li ) 
												{
													// we have the edit div, let's get the contents	  
													// exit( 'an edit class node was found');
													// get each list and save to the ordinal index for our array
													$val = '';
													// remove the .hide class if present to 
													// prevent entries from hiding when xml loads next time.
													$class = $li->getAttribute( 'class' );
													if( preg_match( '~^[ hide]$~', $class ) ) 
													{
														$val = str_replace( $class, '7#77****88#8', $val );
														$liClassTxt = str_replace( ' hide', '', $class );
														$val = str_replace( '7#77****88#8', $class, $val );
													} 

													// ad hoc not LI's added by admins have NO SPAN.
													// have to account for this when saving.

													// DEFINE THE jobNmbr VARIABLE AS THE 1st SPAN CHILD
													$span = $li->getElementsByTagName( "span" );
													if( $span->length ) 
													{
														// this LI contains at least 1 node of type "span".

														// the 1st span node [aka item(0)] will usually be the
														// jobnumber-identity-holder (within its 'id' attribute).

														// copied / pasted jobs don't have an id attrib,
														// but do use a class beginning with "copyof".
														if( $span->item( 0 )->getAttribute( "id" ) ) 
														{
															$jobNmbr = $span->item( 0 )->getAttribute( "id" );
															if( strlen($jobNmbr) > 2 ) 
															{
																if( strpos( $jobNmbr, 'job_' ) !== false ) 
																{
																	// the span's id attrib holds our job number;
																	// store the job number:
																	$jobNmbr = str_replace( "job_", "", $jobNmbr );
																} 
																elseif( strpos( $jobNmbr, 'note' ) !== false ) 
																{
																	// this is a [+] added LI by an admin.
																	$jobNmbr = $jobNmbr.$adminNoteSuffix;
																	$adminNoteSuffix++;
																}
															} 
															else 
															{
																$jobNmbr = null;
															}// if/else id attrib len > 2
														} // end if( $span->item( 0 )->getAttribute( "id" ) )
														elseif( strlen( $span->item( 0 )->getAttribute( "class" ) ) > 2 ) 
														{
															//span has no id attrib.  Try for "class" attrib:
															//e.g., 'copyof' spans.
															$clasVal = $span->item( 0 )->getAttribute( "class" );			
															if( strpos( $clasVal, 'copyof' ) !== false ) 
															{					
																$jobNmbr = $clasVal;						
															} 
															elseif( strpos( $clasVal, 'note' ) !== false ) 
															{
																//there can be classes instead of id's
																//of value "admin-note"
																$jobNmbr = 'admin-note';							
															}
														} // end elseif( strlen( $span->item( 0 )->getAttribute( "class" ) ) > 2 ).
														else 
														{
															$jobNmbr = null;
														}
													} // end if( $span->length )										
													$val .= (string)$htmlDoc->saveHTML( $li );
													$val = str_replace('<br>', '', $val);
													// substitute in placeholders for all illegal XML doc characters:
													$val = str_replace('</', '*^*', $val);
													$val = str_replace('<', '~~', $val); 
													$val = str_replace('/>', '$^$', $val); 
													$val = str_replace('>', '#$#', $val);
													if($jobNmbr !== null)
													{
														$xmlToSaveArray[ $yearOrd ][ $monthOrd ][ $ord ][ $jobNmbr ] = $val;
													}												
												}//end $childUL->getElementsByTagName( "li" ) as $li
										    }//end if li length
										} // end $childUL->getAttribute( "class" ) == "edit"
									}//end for each date div
							    }
						} //end if date div

					}//end if month div
				}
				//exit( var_dump( $xmlToSaveArray ) ); 
			   /* ***************NOW BEGIN ITERATING OVER THE XML DOC NODES, SAVING DATA FROM xmlToSaveArray******************** */
			   //for( $xyr = 0; $XMLyr = $this->init->companyCalendar->getElementsByTagName( 'year' )->item( $xyr ); $xyr++ ) 
			   foreach( $this->init->arXmlYearNodes as $nodeIndex => $XMLyr )
			   {
					// iterate the month nodes in the (each) year node(s) of the xml doc.
					$currentXMLyr = ( integer ) $XMLyr->getAttribute( 'ordinal' );		   	
				   
				    // companyCalendar XML's month nodes, each as $m.
				    for( $i = 0; $m = $XMLyr->getElementsByTagName( 'month' )->item( $i ); $i++ ) 
				    {
					    // the xml month's ordinal will be used to map it to the index value of our html 
					    // within our xmlToSaveArray
					    $currentXMLmo = ( integer )$m->getAttribute( 'ordinal' );
					    for( $s = 0; $d = $m->getElementsByTagName( "day" )->item( $s ); $s++ ) 
					    {
						    $currentXMLday = ( integer )$d->getAttribute( 'ordinal' );
						    // prevent moved jobs in cal from duplicating across original and new date.
						    // Best just to completely remove all job nodes from the XML doc,
						    // then append the new jobs using the updated html array:
						    for( $iJ = 0; $j = $d->getElementsByTagName( "job" )->item( $iJ ); $iJ++ ){
							   $d->removeChild( $j );
						    }
						    $d->nodeValue = '';
							  
							// Structure for June 4 2017, contents for job # 01234 is like this: array[2017][6][4][01234]=>li contents
						    $HTMLdayContentsArray = array();
							//go directly to the html array contents for the current XML day node that we have accessed:	
							if( isset($xmlToSaveArray[$currentXMLyr][$currentXMLmo][$currentXMLday] ) )	
							{		     
								$HTMLdayContentsArray = $xmlToSaveArray[$currentXMLyr][$currentXMLmo][$currentXMLday];
							}	
						   	/******************************************** BUG FIX ************************************************/
							//BUG DISCOVERED:  Because we are using job numbers as the assoc array key for the LI content,
							//we OVERWRITE prior keys with name "admin-note".  This is why only one admin note is saved,
							//always being the LAST admin-note in a date cell.  It overwrites prior array member(s).
							
							/* 8-24-2018 Solution: append incrementing numeral to the assoc key name:  Remove all chars after
							/* "-note" before setting the key name as the <job number="" value for the XML node. */
							   
							
							if( count( $HTMLdayContentsArray ) > 0 ) 
							{ //array of LIs with content with index value of job number.
								foreach( $HTMLdayContentsArray as $jNbr => $job ) 
								{
									
									//if the key contains 'min-note', there will be a unique nmbr appended
									//to make this a unique keyname to prevent overwriting of array elements
									//to prevent build-up of numbers on each save and allow precise 
									//str matching of 'admin-note' elsewhere in code, trim off that number:
									if(strpos($jNbr, "min-note", 0))
									{
										$jNbr = substr( $jNbr , 0 , 10 ); //return str of 1st 10 chars.
									}								
								   $jobNode = $this->init->doc->createElement( 'job', $job );
								   $attrib = $this->init->doc->createAttribute( 'number' );
								   // assign job# to the new attribute
								   $attrib->value = $jNbr;
								   // attach attrib to the new element
								   $jobNode->appendChild( $attrib );
								   // append this as a node to this day node:
								   $d->appendChild( $jobNode );
								   $this->init->doc->formatOutput = true;									
								   // Save the XML with the appended node.
								   $this->init->doc->save( $this->init->xmlPath.$this->init->xmlfile );
								}
							 } 
							 else 
							 {
								// if update has nothing to add, the xml's date cell needs to be emptied
								$d->nodeValue = '';
							 }
					    }//end for $d				    
					}// end each month in xml
				}// end each year in xml
				// Nicely format the structure.
				// save change
				$this->init->doc->formatOutput = true;
				// Save the XML with the appended node.
				if( $this->init->doc->save( $this->init->xmlPath.$this->init->xmlfile ) ) 
				{
					$msg = array('msg'=>"Successfully saved.");
					echo json_encode($msg);
				}
				else 
				{
					$msg = array('msg'=>"Save status uncertain; try again, then reload the page to see if updates held.  If this message continues, notify Web Team.");
					echo json_encode($msg);
				}
				exit;			
			}// END else user does have access token
		}// END if we connect to the database
		else 
		{
			// user does NOT have the access_token permission to save at this time.
			$msg = array('msg'=>"Database Connection Failed: Could not Confirm Your User Privileges. Action not completed.");
			echo json_encode($msg);				
		}
		 
	}// end saveMonth method.


}