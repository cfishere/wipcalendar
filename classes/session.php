<?php
// Include our Database Abstraction Layer.
// 
/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/

include_once ($_SERVER['DOCUMENT_ROOT'].'/../classes/dbConnPDO.php');
/**
/**
 * Session
 */
class Session extends dbConnPDO {
 
	  /**
	   * Db Object
	   */

	  private $db;
	  
	  public function __construct(){

		  // Instantiate new Database object

		  
		  $this->db = parent::dbOpen('custo299_wipcalendar');

		  //getting unauthorized messages for Outdoor Admins
		  //when attempting to save the calendar.  Might 
		  //be related to the PHP upgrade to 7.2 and
		  //how PHP handles these errors.
		  if(!isset($_SESSION))
		  {
			  // Set handler to overide SESSION
			  session_set_save_handler(
				array($this, "_open"),
				array($this, "_close"),
				array($this, "_read"),
				array($this, "_write"),
				array($this, "_destroy"),
				array($this, "_gc")
			  );

			  // for debugging only, turn on errors
			  // error_reporting(E_ALL);

			  // Start the session
			  session_start();
		  }
		  
	  }

	/**
	 * Open
	 */
	public function _open(){
	  // If successful
		
	  // doing it this way allows only 1
	  // session at a time (creates and uses just sess in the db, reuses it)
	  /*if( $this->db ){
	    // Return True
	    return true;
	  }*/
	 if( parent::dbOpen('custo299_wipcalendar') ){
	    // Return True
	    return true;
	  }
		
		
	  // Return False
	  return false;
	}
	
	
	/**
	 * Close
	 */
	public function _close(){
	  // Close the database connection
	  // If successful
	  if(parent::dbClose($this->db)){
	    // Return True
	    return true;
	  }
	  // Return False
	  return false;
	}	
	
	/**
	  * If the query returns data, we can return the data. 
	  * If the query did not return any data, we simply return an empty string. 
	  * The data from this method is passed to the Global Session array that can 
	  * be accessed like this: 
	  * echo "<pre>";
	  * print_r($_SESSION);
	  * echo "</pre>";
	  */
	
	/**
	 * Read
	 */
	public function _read($id){
	  // Set query
	   
	   $statem = $this->db->prepare('SELECT data FROM sessions WHERE id = :id LIMIT 1');

	  // Bind the Id
	   //$statem->execute(['id' => $id]);

	  // Attempt execution
	  // If successful
	  if( $statem->execute(['id' => $id]) ){
		
	    // Saved row
	    
	    // Get the saved row.
	    $row =  $statem->fetch(); 	  
		
	    // Return the data from the row.
		  if (is_null($row['data'])) {
				return '';
			} else {
			  return $row['data'];
		  }
	    
	  }else{
	    // Return an empty string
	    return '';
	  }
	}
	
	/**
	 * Whenever the Session is updated, it will require the Write method. 
	 * The Write method takes the Session Id and the Session data from the Global 
	 * Session array. The access token is the current time stamp.
	 *
	 * In order to prevent SQL injection, we bind the data to the query before it is executed.
	 * If the query is executed correctly, we return true, otherwise we return false.
	 */
	
	/**
	 * Write
	 */
	public function _write($id, $data){
	  // Create time stamp
	  $access = time();
	
		
/*
get all admin active_token records
//if active_token result !== 1, delete all if any.
else
// match the 1 result against sessions.id to affirm if leased to current user
// if id === id_session, update both tbls sessions & active_token
//else update $data[user][role] to 'user'
//end else.
Replace sessions tbl with new data.
success return true else return false.
*/
		//session_start();
		//$data is serialized in session. 
		//$dataAr = $this->unserializesession($data);
		
		//var_dump($dataAr);
		//print_r($data);
		
	// current user's role: admin or user?
	//if( $dataAr[ 'user']['role']  == 'admin' ){
		
		
		/*
		
		//echo 'user is an admin!';
		//get all admin active_token records, which have a matching FK sess id in sessions.
		$stmtToken = $this->db->prepare('SELECT active_token.id, active_token.access_level, 
		active_token.id_session, active_token.checked_out, sessions.id 
		FROM active_token  
		JOIN sessions ON active_token.id_session = sessions.id '); // TODO?: WHERE a.access_level = "admin"' 
		
		//if found our current user owns lease on token tbl, update both tbls with new data.
		if( $stmtToken->execute() ) {
			if( $row = $stmtToken->fetchAll(PDO::FETCH_ASSOC) ){ 
			  
				
			  //There can only be 1 admin at a time...if more than one.  Delete all tokens, create new.
			  if( count($row) !== 1 ){				  
				  foreach( $row as $r ){					  
					  $stmtDel = $this->db->prepare('DELETE active_token WHERE id = '.$row['id']);
					  $stmtDel->execute();					  
				  } //foreach
			  } //if count>1
			// else found only the 1 token:
			 //else {
				 //update both tbls
				 
				 //sessions tbl				
				$stmtSess = $this->db->prepare('REPLACE INTO sessions VALUES (:id, :access, :data)');
				// Bind data
				$stmtSess->bindParam(':id', $id);
				$stmtSess->bindParam(':access', $access);  
				$stmtSess->bindParam(':data', $data);
				 
				 //token tbl
				 //$stmtUpdateToken = $this->db->prepare('REPLACE INTO active_token VALUES (:id_session)'); /*WHERE id = '. $row['id']);
				 $stmtUpdateToken->bindParam(':id_session', $id);
				 
				 if( $stmtSess->execute() ){
					 $stmtUpdateToken->execute();
					 return true;
				 } else {
					 return false;
				 }			
						
		} // could not execute stmtToken fetchAll
	} else { //this is still an admin, and no token is leased to anyone; lease to this user:
			//echo 'no lease assigned to an admin in db';
				//sessions tbl	
		
		
				$stmtSess = $this->db->prepare('REPLACE INTO sessions VALUES (:id, :access, :data)');
				// Bind data
				$stmtSess->bindParam(':id', $id);
				$stmtSess->bindParam(':access', $access);  
				$stmtSess->bindParam(':data', $data);
				 
				 //token tbl
				 //$stmtUpdateToken = $this->db->prepare('REPLACE INTO active_token VALUES (:id_session)'); /*WHERE id = '. $row['id']);
				 $stmtUpdateToken->bindParam(':id_session', $id);
				 
				 if( $stmtSess->execute() ){
					 $stmtUpdateToken->execute();
					 return true;
				 } else {
					 return false;
				 }
			
			
		
		}	
		
	} // this is not an admin user; active_token tbl can be ignored.
	else {*/ 
		//echo 'Hey this dude is not even an admin.';
		
		//sessions tbl				
		$stmtSess = $this->db->prepare('REPLACE INTO sessions VALUES (:id, :access, :data)');
		// Bind data
		$stmtSess->bindParam(':id', $id);
		$stmtSess->bindParam(':access', $access);  
		$stmtSess->bindParam(':data', $data);
		//$stmtSess->bindParam(':fk_id_user', $fk_id_user);
		
		if( $stmtSess->execute() ) {
			
			return true;
			
		} else {
			
			return false;
			
		}		
	
	//} //end else not an admin
		
		
}

	
	
	/**
	 * Destroys session based upon database id;
	 * Method called when the session destroy global function is invoked by a script, like this:
	 * session_destroy();
	 */
	
	/**
	 * Destroy
	 */
	public function _destroy($id){
	  // Set query
	  $statem = $this->db->prepare('DELETE FROM sessions WHERE id = :id');

	  // Bind data
	  // $statem->bind(':id', $id);

	  // Attempt execution
	  // If successful
	  if( $statem->execute(['id' => $id]) ){
	    // Return True
	    return true;
	  }

	  // Return False
	  return false;
	} 
	
	/**
	 * The Garbage Collection function will be run by the server to clean up any 
	 * expired Sessions that are lingering in the database. The Garbage Collection 
	 * function is run depending on a couple of settings configured on the server.
	 * SEE *note, below.
	 */
	
	/**
	 * Garbage Collection
	 */
	public function _gc($max){
	  // Calculate what is to be deemed old
	  $old = time() - $max;

	  // Set query
	  $statem = $this->db->prepare('DELETE FROM `sessions` WHERE `access` < :old');

	  // Bind data
	  $statem->bindParam(':old', $old);

	  // Attempt execution
	  if($statem->execute()){
	    // Return True
	    return true;
	  }

	  return false;
	}
	
	function unserializesession($data) {
   $vars=preg_split('/([a-zA-Z0-9]+)\|/',$data,-1,PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
   for($i=0; $vars[$i]; $i++) {
       $result[$vars[$i++]]=unserialize($vars[$i]);       
   }
   return $result;
}
 
}

/* NOTE:
The Garbage collection is run based upon the session.gc_probability and session.gc_divisor settings on our server. Say for example the probability is set to 1000 and the divisor is 1. This would mean that for every page request, there would be a 0.01% chance the Garbage collection method would be run.

The method is passed a max variable. This relates to the maximum number of seconds before PHP recognizes a Session has expired. This is a setting that can be edited.

Both settings above can be modified in php.ini.
*/
