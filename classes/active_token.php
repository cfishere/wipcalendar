<?php
// Include our Database Abstraction Layer.
//include($_SERVER['DOCUMENT_ROOT'].'/../classes/dbConnPDO.php');
/**
/**
 * app/classes/active_token.php
 * Is there a field in active_token set for current user?
 * Only returns True or False.
 * [ Prefix 'ac_' to methods to avoid clashes with parent names ]
 */
class Active_Token extends userAuthenticate {
 
	  /**
	   * Db Object
	   */

	  private $dbcx;
	  private $userId;
	  private $companyId;
	  
	  public function __construct(){
		  parent::__construct();
		  if( $this->dbcx = $this->pdo ){
		    // Return True
		    return true;
		  }		

		  // Return False
		  return false;
		  
	  }

	
	/**
	 * Close
	 */
	public function at_close(){
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
	 * confirm current browser session's userid and company id 
	 * are set in the active_token tb table.
	 * Return Bool 
	 */
	public function tokenSet($uid,$cid){
		 //may use these values to help with tokenUsers function.
		 $this->userId = $uid; //user id
		 $this->companyId = $cid; //company id
		
		 if( is_object($this->dbcx) ){
			 
		    // $db connection object is set			 
			$q = $this->dbcx->prepare('SELECT * FROM active_token WHERE coid_token = :cid AND id_user = :uid');
			$q->bindParam(':uid', $uid, PDO::PARAM_INT);
			$q->bindParam(':cid', $cid, PDO::PARAM_INT);
		
			if($q->execute){				
				
				// Was there a matching row in active_token for current user?
				if( $q->columnCount() > 0 ){					 
					return true;	
					
				} else {
					
					return false;
				}
				
			} else {
				
				//query failed
				return false;
			}
		    
		  }	else {	

		  // Return False
		  return false;
		}		
		
	}
	
	/**
	 * fetch and return all user info for active tokens
	 * are set in the active_token tb table.
	 * Return Bool 
	 */
	public function tokenUsers(){
		$this->dbcx = $this->pdo;
		$tokenUsers=array();		
		if(is_object($this->dbcx)){		
			
			/* TABLE active_token:				
					id, 
					coid_token (int), 
					access_level (varchar), 
					id_session (suppopsed to hold the session id, but does not, always NULL),
					id_user,
					recent_login (unix time)
			*/	
			
			$stmt = $this->dbcx->prepare("SELECT * FROM `active_token` WHERE `id_user` > 0");
			if($stmt->execute()){				
				// Did query return any records?
				$row = $stmt->fetch(PDO::FETCH_ASSOC);
				if( count($row) > 0 ){
					
					
					$i=0;
					while( $row = $stmt->fetch(PDO::FETCH_ASSOC) ){	
						
						//if the record for the logged in user is found,
						//do not add that into the returned array (index.php already has this info)
						if( $row['id_user'] !== $this->userId ){						
							$stmt2 = $this->dbcx->prepare("SELECT `username`,`email`,`role` FROM users WHERE id = ".$row['id_user']);
							if($stmt2->execute()){
								
								$row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
									if (isset($row2)){
										$row['username'] = $row2['username'];
										$row['email'] = $row2['email'];
										$row['role'] = $row2['role'];
									}
							}
							$tokenUsers['list'][$i] = $row;
							$i++;
						}	
					}
				} 	
			}
		}	else {
			//debug: the db connection is not working
			$tokenUsers['list'][0]['username']='Cannot Connect to DB';
			$tokenUsers['list'][0]['role']='Sadness';
		}
		
		return $tokenUsers;
	}
	
	
}//class
	