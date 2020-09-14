<?php

include_once ($_SERVER['DOCUMENT_ROOT'].'/../classes/dbConnPDO.php');

class Init extends dbConnPDO
{
	public $pdoDB; 	//db connection obj.
	public $cMo; 	//current mo.
	public $cYr; 	//current yr.
	
	/* 
	 * Post Data includes content,year,month,theDate,company,method (to call)
	 * $POST Elements saved to class Properties [using same var name].
	 * Form POST Data -- Index Key-Names 
	 */ 
	public $content;
	public $year; // sent as json of y = today.getFullYear();
	public $month;	// sent as json today.getMonth()+1; //month is zero-based (+1)
	public $theDate; // sent as json today.getDate(); //current date.
	public $company; // javascript global curCompany (name of company)
	public $method; // calendar class' method to call (e.g., "display()")
	/* Form POST Data -- END Key-Name properties */

	// $path on the local environment equates to: C:\inetpub\wwwroot\customsigncenter.com\calendar
	public $path = __DIR__;	// classes dir
	// protected $app_root = dirname(__FILE__);
	public $xmlPath;	// hold path to XML file storage (i.e., $path.'/models')
	
	// private $domDocument; //not using this property
	// end submitted data
	public $ds = DIRECTORY_SEPARATOR;
	// public $calNode;
	public $companyCalendar;
	public $msg = '';
	public $doc; // document obj to traverse over the xml tags
	public $activeMonthNode; // obj to refer to this month node in xml for finding correct days in the xml tree.
	public $activeYearNode;
	public $activeDateNode; // obj to refer to this date node in the xml.  For Update operations.
	public $activeOrdinalCell; //the current day's cell number in the calendar layout.  (div #x) //for hightlighting the current day's html.
	public $day1Cell; // the html div location of the first date of the cur mo.  (Sunday = 1, Tuesday = 3)
	public $activeMonthName; // e.g. "June"
	public $activeMonthOrdinal;// e.g. "6" for June
	public $responseArray = array();
	public $xmlfile;
	public $arXmlYearNodes = array(); //hold the year node objs if more than one yr is in the xml doc	
	public $userCompany;  // defines privileges based upon user's company.  Also used to define if this is a developer in the dev folder.
	function __construct()
	{
		//echo "Debug: This is the unprocessed data received by init() " .PHP_EOL;
		//print_r($_POST);
		
		$this->pdoDB = parent::dbOpen('custo299_wipcalendar');		
		
		foreach($_POST as $k=>$v){
			$this->$k=$v;
		}//$this->content, $this->year, $this->month,$this->theDate, $this->company, $this->method) = $_POST;	
		
		 $this->cMo = date('m');
		 $this->cYr = date('Y');
		
		$opts = array(
		    'http' => array(
			   'user_agent' => 'PHP libxml agent',
		    )
		);
		$this->company = trim($_POST['company']);
				
		switch($this->company){			
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
		     case 'MarionOutdoor':
			$this->xmlfile = 'marion-outdoor.xml';
			break;						
		}
		
		//if development server, use a different path for the xml 
		//define the xml path:
		if( preg_match('~wwwroot~', $this->path) ) {
			//  page loading from local development server = true.
			//	when ran on the x drive IIS server, it equates to:			
			//	C:\inetpub\wwwroot\customsigncenter.com\calendar\[dev\]models
		 	$this->xmlPath = dirname($this->path).$this->ds.'models'.$this->ds;
			// No user session required.  Full access to work in the /dev directory files.
			$this->userCompany = 'developer';			 
		} else { 
			$this->xmlPath = dirname($this->path).$this->ds.'models'.$this->ds;
			$this->userCompany = $this->company;
		}		
		$context = stream_context_create($opts);
		libxml_set_streams_context($context);		
		//echo $this->xmlPath.$this->xmlfile;
		if (file_exists(realpath ( $this->xmlPath.$this->xmlfile ))) 
		{
			/* 	// DEBUG :: file exists & path to:
			 	echo "The file exists and it is at ".$this->xmlPath.$this->xmlfile; 
			 	exit;
			*/
				
			$this->doc = new DOMDocument();
			
			//http://de.php.net/manual/en/domdocument.load.php		
			if( $this->doc->load( filter_var( realpath( $this->xmlPath.$this->xmlfile ) ), LIBXML_NOBLANKS) )
			{	
				//exit('The xml file loaded.');
				$this->companyCalendar = $this->doc->getElementsByTagName( "calendar" )->item( 0 );
				// get each of the year nodes as $yrNode, and save to our year node array;
				for( $i = 0; $yrNode = $this->companyCalendar->getElementsByTagName( "year" )->item( $i ); $i++ ) 
				{		    		
					//echo "Found a year node and it is ".$yrNode->getAttribute("ordinal");
					if( ( integer )$yrNode->getAttribute( "ordinal" ) === ( integer )$this->year )
					{
						$this->activeYearNode = $yrNode;
						// echo '$this->activeYearNode equates to'. $this->activeYearNode;
					}
					// store year node(s) to an array:
					array_push( $this->arXmlYearNodes, $yrNode );		
				}
				
				foreach( $this->arXmlYearNodes as $yrNODE )
				{
					$this->iterateYEAR( $yrNODE );// arg = domDoc NODE ('year')
				}
			} 
			else 
			{
				exit('THE FILE DID NOT LOAD');
			}
			 //var_dump($this->arXmlYearNodes); exit;
		}//file_exists
		else 
		{
			//echo '    NO.  The xml document does not exist.';
		}		 
	}

	// xml node obj YEAR passed in (for each yr in the xml file, this function runs)
	// func called automatically from init function everytime this script runs
	function iterateYEAR( $yrNODE )
	{		
		$searchNode = $yrNODE->getElementsByTagName( "month" );					
		foreach( $searchNode as $sNode ) 
		{								
	    	if( ( integer ) $sNode->getAttribute( "ordinal" ) === ( integer ) $this->month  )
			{						
				$this->activeMonthName = $sNode->getAttribute("name");
				$this->activeMonthOrdinal = $this->month;						
				$this->activeMonthNode = $sNode;
				
			}
		}
		//get the array index value for the current month (ordinal - 1).
		$moOrdin = ( integer ) $this->activeMonthOrdinal -1; // e.g. may will be: 5 - 1		
		$this->cYr = $yrNODE->getAttribute( "ordinal" );

		/* Neither $mo or $curWks is used anywhere else.  
		if( is_object( $this->activeMonthNode ) )
		{
			$Mo = $yrNODE->getElementsByTagName( 'month' )->item( $this->activeMonthOrdinal -1 );
			$curWks = $this->activeMonthNode->getElementsByTagName( 'week' );
		}	
		*/	
	
	  	// if this request is for a future or past month, don't show the activeOrdinalCell.
	  	// if requested year is not this current year, no activeCell.
	    if( $this->year === $this->cYr && $this->month === $this->cMo )
	    {
	    	// exit('We have the xml nodes representing this current yr and month');
		  	// avoid fatal error activeMonthNode is NULL
			if( $this->activeMonthNode )
			{
				
				for( $x = 0; $dayNode = $this->activeMonthNode->getElementsByTagName( "day" )->item( $x ); $x++ )
				{		
					//store the XML node object; active cell's ordinal position into our class properties. 		
					if( ( integer ) $dayNode->getAttribute( "date" ) == ( integer ) $this->theDate )
					{
						$this->activeDateNode = $dayNode; //obj to refer to this date node in the xml.  For Update operations.
						$this->activeOrdinalCell = $dayNode->getAttribute( "ordinal" ); //for hightlighting the current day's html.
						/* // DEBUG: are we storing today's node, for special CSS styling? */
						
					}
				}
			}
		}		
	}	
}