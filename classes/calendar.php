<?php
//DEBUG MODE:
// 
/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/

include_once 'Init.php';
include_once 'Save.php';

//model = models/calendarXML.php
//The internal errors 'true' eliminates WARNING on save
//related to ~line 195: $htmlDoc->loadHTML($this->content);
//Even Tho the calendar saves correctly, the user does not 
//receive the "Successfully Saved" confirmation, apparently bc
//some of the content (ampersands, etc) are illegal (not htmlentity-encoded.)
//libxml_use_internal_errors(true);

$c = new calendar;
class calendar {

	public $init;
	public $save;

	 public function __construct()
	 {
	 	
	 	$this->init = new Init;
		

		if( $this->init->method==NULL || empty( $this->init->method ) )
		{
			$this->display;
		} 
		else 
		{	
			$action = $this->init->method; //the user requested action.
			if( $action === 'saveMonth' )
			{
				$this->save = new Save;
				$this->save->month();
			}
			else
			{
				$this->$action();//update, display...etc. [set by init()]
			}
		}
	}
	
// display the company calendar
 function display() 
 { 	
	 $row = '';// rows are the weeks in html
	 $cells = '';// date cells as html output
	 
	 foreach( $this->init->arXmlYearNodes as $yrNODE )
	 {
		    $searchMonthNode = $yrNODE->getElementsByTagName('month');
		    foreach($searchMonthNode as $searchMonth) //foreach1
		    {
			    //echo 'activemonthordinal is: ' . $this->init->activeMonthOrdinal . ' and the xml node ordinal is: '. $searchMonth->getAttribute('ordinal');
			    if((integer)$this->init->activeMonthOrdinal == (integer)$searchMonth->getAttribute('ordinal'))
			    { 
				    $row .= '<div class="month" ordinal="'.$searchMonth->getAttribute('ordinal').'" yr="'.$yrNODE->getAttribute('ordinal').'">';
			    }
			    else 
			    {
				    $row .= '<div class="month hide" ordinal="'.$searchMonth->getAttribute('ordinal').'" yr="'.$yrNODE->getAttribute('ordinal').'">';
			    }
		    // start building the html for calendar cells;
		    $searchNode = $searchMonth->getElementsByTagName('week'); // xml week nodes for the month
		    $i=1;
		    foreach( $searchNode as $wkKey => $searchNode ) // for each week node, build as a row
		    {				    
			    // must clear your cells for each new row of weeks.
			    unset($cells); $cells='';
			    $row .= '<div class="calRow" id="row'.($i).'">'; // row1, row2, etc.
			    $i++;
			    for( $t = 0; $dayNode = $searchNode->getElementsByTagName('day')->item($t); $t++ )
			    {
			    	//if $t===0, this is Sunday, and we want to add a button to open each week in a modal
			    	$viewWeekInModal = '';
			    	if( $t===0 )
			    	{
			    		$viewWeekInModal = '<img onclick="modalOpen(this,\'week\')" src="assets/view-week-btn.png" title="view and print this week" class="modalImg" id="Week-' . (integer)($wkKey+1) . '" >';
			    	}
				    if($dayNode->getAttribute("date") === '' || $dayNode->getAttribute("date") === NULL || empty($dayNode->getAttribute("date"))) // if1
				    { // echo ' day cell; not a date.  ';
					    $cells .='<div class="empty" ordinal="'.$dayNode->getAttribute("ordinal").'"></div>';
				    }  // end if1
				    else  // else1
				    {
					    $dayContents = '';
					    
					    // JOB NODES:
					    for( $iJ = 0; $jNode = $dayNode->getElementsByTagName('job')->item($iJ); $iJ++) 
					    {						    
						    if( !empty($jNode->nodeValue ) )
						    {
						    	/* //DEBUG::Checkpoint -- a job node with some content is found:
									 exit("Job Node Content is: ". $jNode->nodeValue);
						    	*/
							   $respConent = str_replace('*^*', '</', $jNode->nodeValue);
							   $respConent = str_replace('~~', '<', $respConent); 
							   $respConent = str_replace('$^$', '/>', $respConent); 
							   $respConent = str_replace('#$#', '>', $respConent); 
							   
							   // echo 'respContent is: ' . $respConent . '<br/>';
							   $pos = strpos($respConent,'class=');
							   //echo '$pos is '.$pos;
							   $liClassTxt = substr($respConent,$pos,35); // get str starting with class="
							   // echo '$liClassTxt is'.$liClassTxt;
							   if(preg_match('~^[hide]$~',$liClassTxt)) // is 'hide' in that class= str?
							   {
								  	$respConent = str_replace($liClassTxt,'7#77****88#8',$respConent);
								  	$liClassTxt = str_replace( 'hide','',$liClassTxt);
								  	$respConent = str_replace('7#77****88#8',$liClassTxt,$respConent);
							    }
							    $dayContents .= $respConent;
							    // echo $dayContents;
						    }
						}// end for each jobnode								    
						// is this today's cell?
					    if( (integer)$this->init->activeOrdinalCell === (integer)$dayNode->getAttribute("ordinal") && (integer)$this->init->activeMonthOrdinal === (integer)$searchMonth->getAttribute('ordinal') ) //if2
					    {
						    // this is today's cell, with special styling applied:
						    $cells .='<div class="date today" ordinal="'.$dayNode->getAttribute("ordinal").'"><div class="day">
						    '.$viewWeekInModal.'<img onclick="modalOpen(this,\'day\')" src="assets/write-circle-green-128.png" title="edit" class="modalImg" id="d'.$dayNode->getAttribute("date").'" />
						    <span class="addNewLine" onclick="addNewLine(this, modal)">&nbsp;+&nbsp;</span>'.$dayNode->getAttribute("date").
						    '</div><ul modalId="d'.$dayNode->getAttribute("date").'" class="edit">'. $dayContents .'</ul></div>';
					    } // end if2
					    else // else 2
					    {
						    $cells .='<div class="date" ordinal="'.$dayNode->getAttribute("ordinal").'"><div class="day">
						    '.$viewWeekInModal.'<img onclick="modalOpen(this,\'day\')" src="/calendar/assets/write-circle-green-128.png" title="edit" class="modalImg" id="d'.$dayNode->getAttribute("date").'" />
						    <span class="addNewLine" onclick="addNewLine(this, modal)">&nbsp;+&nbsp;</span>'.$dayNode->getAttribute("date").
						    '</div><ul modalId="d'.$dayNode->getAttribute("date").'" class="edit">'. $dayContents .'</ul></div>';
					    } // end else 2							    
					}  // end else1			
				}  // end for each daynode        	
					  $row .= $cells ."</div>"; // close the row div with all children of cells inside;	    
			} // end foreach2		
			    $row .= "</div>"; // close the month div.	
		    } // end foreach $searchMonth
	   } // end foreach $yrNODE
	   
	   //prepare response array
	   // $this->init->responseArray["firstCell"] =  $this->day1Cell;	
	    $this->init->responseArray["year"] =  $this->init->year;
	    $this->init->responseArray["activeMonthName"] =  $this->init->activeMonthName;
	    $this->init->responseArray["activeMonthNumber"] = $this->init->activeMonthOrdinal;
	    $this->init->responseArray["activeOrdinalCell"] = $this->init->activeOrdinalCell;
	    $this->init->responseArray["theDate"] =  $this->init->theDate;
	    $this->init->responseArray["userCompany"] = $this->init->userCompany;
	    $this->init->responseArray["html"] =  $row;
	    $response = json_encode($this->init->responseArray);
	   // GZIP: compress the string first to enhance speed. $compressedResponse = gzencode($response);
	    echo $response;
	    exit;   
   }//end display()	

}//end class


?>