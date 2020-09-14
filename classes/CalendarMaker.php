<?php

/**
* Build an XML doc calendar as a template 
* Used to dynamically generate the calendar nodes
* Template Loaded by the Calendar Backup Script
**/

// build calendar array using php time functions

//fire construct func
$c=new CalendarMaker;

// expects post data 'startdate', 'enddate', 'company' formatted as 01/31/2017
class CalendarMaker {
	
	//POST variables:
	private $startdate; //mm/dd/Y
	private $enddate;
	private $company;
	
	//other class properties
	private $Calendars; //simpleXML obj, named for root node.
	private $fname;
	private $status; 
	private $savePath = __DIR__."/models/backup/";
	
	
	private $nodeCalId;
	private $nodeYearOrd;
	
	//Date Properties
	private $monthList; //array => year (['2017] => array ('months'([0] => (['name'] = 'January', ['ordinal'] = '1', [2] => ),
					//	   ['2018'] 
	
	
	
	
	function __construct(){
		

		foreach( $_POST[] as $k=>$x ){
			
			if( empty($x) ){
				
				exit("fail - missing data for " . $k);
				
			} else {
				
				$this->$k = $x;
			}
		}		

		$status = 'Application started...<br>';

		//set the filename to use.
		$this->setNames();					

		$this->XMLtemplate = $this->xmlSkeleton();		
		
		echo $status;		
		
	}
	
	
	/**
	 * Set useful variables like 'csc' for file-naming, from 'Custom Sign Center'
	 *
	 **/
	private function setNames(){
		
		$timeName = date('mm-dd-Y_hh-mm', strtotime('now'));
		
		switch ( str_replace(' ','',strtolower($this-company)) ){
				
			case 'customsigncenter' || 'csc':
				$this->fname = $timeName.'$csc.xml';
				$this->nodeCalId = 'Custom Sign Center';
				break;
			case 'outdoorimages' || 'outdoor':
				$this->fname = $timeName.'$out.xml';
				$this->nodeCalId = 'Outdoor Images';
				break;
			case 'boyer' || 'boyersigns':
				$this->fname = $timeName.'$boy.xml';
				$this->nodeCalId = 'Boyer Signs';
				break;
			case 'marionsigns' || 'marion':
				$this->fname = $timeName.'$mar.xml';
				$this->nodeCalId = 'Marion Signs';
				break;
			case 'jgsigns' || 'jg' || 'jgsignservices':
				$this->fname = $timeName.'jg.xml';
				$this->nodeCalId = 'JG Signs';
			default: $this->status .= 'Fatal Error: Company name must be spelled like one of the following:<br>
								  custom sign center, outdoor images, boyer signs, marion signs, jg signs.<br>
								  Exiting.';
				exit($this->status);
		}		
		
	}
	
	
	/**
	 * Create the XML scaffolding 
	 * Load it as the resource 'XML' to build upon.
	 **/
	
	private function xmlSkeleton(){
		
		$this->startDate = explode('/',$this->startdate); // array [0]=mo, [1]day, [2]year
		
		$rawDays = array (
		[7] => '<day ordinal="" name="Sunday" date="">',
		[1] => '<day ordinal="" name="Monday" date="">',
		[2] => '<day ordinal="" name="Tuesday" date="">',
		[3] => '<day ordinal="" name="Wednesday" date="">',
		[4] => '<day ordinal="" name="Thursday" date="">',
		[5] => '<day ordinal="" name="Friday" date="">',
		[6] => '<day ordinal="" name="Saturday" date="">');


		$months = array (
		[1] => '<month ordinal="1" name="January">',
		[2] => '<month ordinal="2" name="February">',
		[3] => '<month ordinal="3" name="March">',
		[4] => '<month ordinal="4" name="April">',
		[5] => '<month ordinal="5" name="May">',
		[6] => '<month ordinal="6" name="June">',
		[7] => '<month ordinal="7" name="July">',
		[8] => '<month ordinal="8" name="August">',
		[9] => '<month ordinal="9" name="September">',
		[10] => '<month ordinal="10" name="October">',
		[11] => '<month ordinal="11" name="November">',
		[12] => '<month ordinal="12" name="December">'
		);
		
		
		//get day-of-wk of first date for the start month:
		
		
		
		//return numeric 1st day of the startdate's month: 1 for monday...7 for sunday
		$firstDay = date('N', strtotime($this->startDate[0].'/1/'.$this->startDate[2])); // e.g., strtotime('5/1/2017')
		
	
		//
		$calMos = array_map( function($el){ 			
			if((integer)key($el) === (integer)$this->startDate[0] ){
				(integer)$this->startDate[0]++;
				return $el;			
			}}, $months);
		
		//$calMos == start month node for calendar, plus all months counting up to 12th.
		
		
		// start bare node framework and initialize as a php resource:
		$this->Calendars = new SimpleXMLElement(
			'<?xml version="1.0" standalone="yes" encoding="utf-8"?>
			<!DOCTYPE calendars [<!ENTITY nbsp "&#160;">]>
			<calendars>
			<calendar id="'. $this->nodeCalId.'">
			<year ordinal="' . $this->startDate[2] . '">				
			</year></calendar></calendars>');
		
		
		// now we have limited months to populate into xml template:		
		foreach($calMos as $ordinal=>$month){	
			
			$NmbrDaysInMonth = date('t', strtotime($ordinal.'/1/'.$this->startDate[2]));
			
			foreach($rawDays as $i=>$day){

				while( $NmbrDaysInMonth > 0 ){
					
					
					
					
					
					if( (string)$firstDay === (string)$i ){
						
						//if 2===2, then the first day to start month is Tuesday.
						
						
						
						
						
					} else {
						
						
						
					}
					
					
					
					$NmbrDaysInMonth--;
					
				}
			}
		}
		
		
		
		
		
		
		
		
		
		
		$moNodes = $this->Calendars->calendar->year[0]->month;
		
	/*	foreach( $moNodes as $mo){
			
			$mo['ordinal']
		}
		*/
		
		
		
		
	}
	
	
	
	
}



