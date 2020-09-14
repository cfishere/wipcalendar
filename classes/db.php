<?php

// // Method manage.  params: string $action = 'connect' or 'disconnect' [, array => (dbname, dbtable) ]

// see dbConn class code, below.
include('../../../../classes/dbConnPDO.php');

class Db extends dbConnPDO {
		
			
	//action open or close and db name.
	static function manage($action, $dbname){
		
		if( $dbname && strtolower($action) === 'open' ) {			
			if( $pdo = parent::dbOpen( strtolower($dbname) ) ){
				//echo'connected to db';
				return $pdo;
				
			} else {
				// cannot process the requested action
				return false;
			}	
		} else {
			
			if(is_object($pdo)){
				
				$this->dbClose($pdo);
			}
			
		}
	} // 'manage' method
	
} // 'db' class
	 
/********** aboveRoot/classes/dbconn.php ** contents ********************************************************

//defined('ROOT_PATH') or die('Restricted Access');
	
	 class dbConn 
	{
		
	
	// Create & Return OOP DB Connection Obj $db
	function dbOpen($db_name) 
	{				
		$db = new mysqli(***foo params***);		
		if($db->connect_error){
			$db = null;			
		} 		
		return $db;
	}
	
	// Close OOP DB Connection Obj $db
	function dbClose($db) 
	{		
		$db->close();
		return;
	}
	
	
} //end dbconn class



*/

?>