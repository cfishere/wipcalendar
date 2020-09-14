<?php
//include('../../../classes/dbConnPDO.php');
//error_reporting(E_ALL);
include('session.php');
class userAuthenticate extends Session {	
	public $pdo;
	public $uUsername;
	public $uPassword;
	public $uViewOnly; //login form's 'view only' checkbox.
	public $uPasswordEncrypted;	
	public $connected; // bool status of db connection
	public $logged;
	public $adminNameWithToken;
	public $userCompany;
	public $reAssignedRole;
	
	
	
	public function __construct(){
		
		parent::__construct();
		/*
		if( preg_match( '~wwwroot~', __DIR__ ) || preg_match( '~dev~', __DIR__ ) ) {			
			$this->userCompany = 'Developer';			
		} 
		*/	
		
		
		// connect to the database		
		if(	$this->pdo = parent::dbOpen('custo299_wipcalendar')){//open connection to wipcalendar db.
			$this->connected = TRUE;
			
			//$cryptOpts = array('cost' => 12,);
			if( !empty($_POST['username']) && !empty($_POST['password'])){
				$this->uUsername = $_POST['username'];
				$this->uPassword = $_POST['password'];
				$this->uViewOnly = isset($_POST['viewonly']) ? 1 : 0; //if view only is set, 1
				$this->uPasswordEncrypted = password_hash ( $_POST['password'], PASSWORD_BCRYPT );
				$this->authenticate();
			}
		} else {
			$this->connected = FALSE;
			//echo 'Could not connect to the database';
		}		
	}
	
	
	
	
	// try user-provided credentials against db records.  return authentication status as bool.
	private function authenticate(){		
		
		//echo 'authenticate called';
		
		$statement = $this->pdo->prepare('SELECT * FROM users WHERE `username` = :username' );		
		$statement->bindParam( ':username', $this->uUsername, PDO::PARAM_STR );		
		if( $statement->execute() ) {			
			$thisUserRow = $statement->fetch(PDO::FETCH_ASSOC);	
			
			//var_dump($thisUserRow); //This counts the COLUMNS returned, NOT the ROWS (records)
			if( $statement->columnCount() > 0 ) {				
				if( password_verify( $this->uPassword, $thisUserRow['password'] ) ) {	
					
					/*//set this user to loggedin = 1
					$statement =  $this->pdo->prepare("UPDATE users SET loggedin = 1 WHERE id = :uid");					
					$statement->bindParam(':uid', $thisUserRow['id'], PDO::PARAM_INT);					
					$statement->execute(); */
					
					// authenticated.  Let's begin by setting the user to the lowest authorization role:					
					$this->reAssignedRole = 'user';					
					$this->setUserCompany( $thisUserRow['company'] );
					if($this->uViewOnly === 0 && $thisUserRow['role'] !== 'user' && !empty($thisUserRow['role'])){
						//echo "Not a user role.  So set admin token called";
						$this->setAdminToken( $thisUserRow );						
					} 
						
					//mark tbl user, `loggedin` field as 1 (i.e., true);
					$status = $this->updateLoggedInStatus( $thisUserRow['id'], true );
					if( $status == true ){
						$loggedInStatus = 'Loggedin ' . date('d-m-Y_h:i', strtotime('now America/New_York'));
					} else {
						$loggedInStatus = false;
					}
					$this->logged = array( 'status'=>'AUTH', 'user' => $thisUserRow['username'], 'role' => $this->reAssignedRole, 'userId' => $thisUserRow['id'], 'company' => $this->userCompany, 'loggedintime' => $loggedInStatus );
					return; //done.														
				} else {
					$this->logged = array( 'status'=>'PSWDfail', 'user' => $thisUserRow['username'], 'role' => 'guest', 'userId' => $thisUserRow['id'], 'company' => $this->userCompany, 'loggedintime' => NULL );
				}			
			} else {
				$this->logged = array( 'status'=>'USRNfail', 'user' => $this->uUsername, 'role' => 'guest' );
			}	
			$this->pdo = NULL; //close the db connection
		}
	}// authenticate()
	
	
	
	
	
	
	
	// setAdminToken only called if authenticated user has admin privilege in user table.
	// set active_token for admin to checked_out = 1, recent_login = linux time, id_user = this user $userRow['id'], id_session to session id of user.
	// if checked_out == 0, or if == 1 but recent_login is older than 1 hour
	// return role as admin or mgr if token set for user of $id; return role as 'user' if token actively leased out to another.
	private function setAdminToken($userRow)
	{
		//var_dump($userRow);
		/*/////////////******** $userRow is
		   array(6) { ["id"]=> int(20) ["username"]=> string(4) "Judy" ["password"]=> string(60) "$2y$10$wEZ0W5fLZ8Z/WUuLdpg/JuLX0OlLkNiLgglAB7sGaJTe7FeIx6x0O" ["email"]=> string(25) "judy@customsigncenter.com" ["role"]=> string(5) "admin" ["company"]=> string(3) "ALL" } */		
				
		//users with role 'user' never call this function.  Don't test for role=user.
		/** We use the following query once we get all access_token records **/
		$updateToken = 'UPDATE active_token SET ';		
		$updateTokenFilter = ' WHERE id = :id';			
		$unixSecs = time();
		
		/*********************************************************/
		
		// QUERY SELECT row from actice_token tbl where company matches authenticated user's company	
		$selectToken = $this->pdo->prepare('SELECT * FROM active_token WHERE coid_token = :userCompany' );
		$selectToken->bindParam(':userCompany', $this->userCompany, PDO::PARAM_INT);
		
		
		if( $selectToken->execute() ){
			/* $tokenInfo = one row from 'access_token' tbl where 
			 * row's company id maps to currently authenticated 
			 * user's company access permissions.
			**/
			$tokenInfo = $selectToken->fetch(PDO::FETCH_ASSOC);
			
			
			if( $userRow['role'] === 'admin' || $userRow['role'] === 'Developer' ){
				//this is a developer logged into the /dev directory
				$this->reAssignedRole = 'admin';
			} elseif( $userRow['role'] === 'mgr' ) {
				$this->reAssignedRole = 'mgr';
			}	
		
			
			if( $tokenInfo['checked_out'] == (integer)0 ){							
				//echo "Checked out value for for coid_token " . $this->userCompany . " is " . $tokenInfo['checked_out'];
				// 0 MEANS TOKEN IS AVAILABLE FOR THIS USER.
				
				/* Prepare to update 'access_token' row to  
				 * reserve the token for this user.
				 */
				$queryToken = 	'UPDATE active_token SET checked_out = :checked_out, recent_login = :recent, '.
				'id_user = :id_user, access_level = :level WHERE id = :id';
				
				$updateStmt = $this->pdo->prepare($queryToken);				
				
				// session not authenticated yet, so set to NULL;
				$updateStmt->bindValue(':checked_out', 1);
				$updateStmt->bindParam(':recent', $unixSecs);
				$updateStmt->bindParam(':id_user', $userRow['id']);
				$updateStmt->bindParam(':id', $tokenInfo['id']);
				$updateStmt->bindParam(':level', $this->reAssignedRole);							  
				
							
				if($updateStmt->execute()) {	
					return;
				} 
				
				
			} // END if( checked_out === NO ).			
			
			else  {  // ( checked_out !== 0 ).	
				//echo "First Else: Checked out value for for coid_token " . $this->userCompany . " is " . $tokenInfo['checked_out'];
				/**
				 * Status: role === admin/mgr/Developer, and active_token.checked_out == 1 for his company
				 * get the id_user of held token, to fetch username of the current user holding it.
				*/ 

				
				/* SCENARIO I:  AUTH USER AND ACTIVE ACCESS_TOKEN HOLDER ARE SAME USER;
				 * SCENARIO II: ANOTHER USER HAS TOKEN, BUT IT IS STALE AND S/HE SHOULD BE BUMPED.
				 * TODO: Scenario II bumping is only achievable if each user action in the app
				 *       is checking the DB for id_user, or looking for the session id in the db.
				 *	    This is bc the browser is maintaining the session.
				 */
				/*
				*/
				//one and same person, Scenario I:	
				if( (integer)$tokenInfo['id_user'] === (integer)$userRow['id'] ){	
					$this->reAssignedRole = 'admin';
					// just update the recent login					
					$upd = $this->pdo->prepare('UPDATE active_token SET recent_login = :recent WHERE id = :id');					
					$upd->bindParam(':recent', $unixSecs);
					$upd->bindParam(':id', $tokenInfo['id']);				
					
					$upd->execute();	
					return;
					// We're done.
					
				/* TODO: Log out stale users. */
				} elseif( (( $unixSecs / 60 ) - ($tokenInfo['recent_login'] / 60) ) > 60 ){
					
					// recent_login value is greater than 60 mins ago [expire it]
					// set token to this user as new admin
					
					
					$query = $updateToken.'recent_login = :recent, checked_out = :co, id_user = :id_u'.$updateTokenFilter;
					$updateStmt = $this->pdo->prepare($query);
					$updateStmt->bindValue(':co', 1);
					$updateStmt->bindParam(':recent', $unixSecs);
					$updateStmt->bindParam(':id_u', $userRow['id']);
					$updateStmt->bindParam(':id', $tokenInfo['id']);

					if( $updateStmt->execute() ) {	

						if( $userRow['role'] === 'admin' || $userRow['role'] === 'Developer' ){
							//this is a developer logged into the /dev directory
							$this->reAssignedRole = 'admin';
						} elseif( $userRow['role'] === 'mgr' ) {
							$this->reAssignedRole = 'mgr';
						}		

					} 
					return;
				} //end elseif time expired on the logged-in admin
				
				 else {
					
					
					//echo 'Someone is already logged in with Admin rights and it ain\'t you.<br/>';
					// give up dude; you can only login as a user right now:
					
					//get the current admin's name for user output notification
					$this->reAssignedRole = 'user';
					$getUser = $this->pdo->prepare( "SELECT username from users WHERE id = :uid" );
					$getUser->bindParam( ':uid', $tokenInfo['id_user'] );
					
						if( $getUser->execute() ){							
							$queryResult = $getUser->fetch(PDO::FETCH_ASSOC);
							$this->adminNameWithToken = $queryResult['username'];					
						} else {							
							$this->adminNameWithToken = "Anonymous";							
						}
				 }
				}//end else if checked_out == 1	
				
			
		}//if token selected in query
		
		 else {
			/*$this->adminNameWithToken = "Anonymous";
			$this->reAssignedRole = 'user';	*/
			 echo "Query to locate a row in the active_token tbl failed.";
		}			
	}// setAdminToken
	
	// called from login.php.
	// Admin logs out; free up the active_token for admin reassignment.
	// returns bool true if unleased, false otherwise.
	public function unleaseToken( $userId ) {	
		
		if( !is_object( $this->pdo ) ) {
			
			if(session_id()){
				$this->_destroy(session_id());
			}
			
			//connect to db
			
			if( $this->pdo = parent::dbOpen('custo299_wipcalendar') ){//open connection to wipcalendar db.
				
				$this->connected = TRUE;		
				
			} else {
				echo "could not connect to db";
				return FALSE;				
				
			}
			
		}		
		
		// db connection active?
		if( $this->connected == TRUE ) {
			
			// 2 tasks: 1. set tbl users loggedin to 0; 2. release this user from the active_token s/he holds; 
			// 1.
			$this->updateLoggedInStatus($userId, false);
			
			// 2.
			// is current user the admin/mgr with the token?
			$query = 'SELECT id, checked_out, recent_login, id_user FROM active_token WHERE id_user = :userId';
			
			$statement = $this->pdo->prepare($query);
			
			$statement->bindParam(':userId', $userId);

			if( $statement->execute() ) {				
									

				if( $statement->columnCount() > 0 ) {				
					
					$userTokenData = $statement->fetch(PDO::FETCH_ASSOC);	
					
					
					$s = $this->pdo->prepare('UPDATE active_token SET checked_out = 0, recent_login = NULL, access_level = \'admin\', id_user = -1 WHERE id = :rowId');
					
					$s->bindParam(':rowId', $userTokenData['id'], PDO::PARAM_INT);

					if( $s->execute() ) {
						$this->adminNameWithToken = "[ NONE ]";
						return true; //token released

					} else {
						
						return false; //token not released.
					}				
				}
			}
		} else {
			
			return false;
		}
		
	}// unleaseToken
	

	

	// map the company in the database from ALL to 0-4 or 10, etc.  Return new value;
	private function setUserCompany($iniCompany){
		
		switch ($iniCompany){			
			case 'ALL':
				$this->userCompany = (integer)0;
				break;
			default:
				$this->userCompany = (integer)$iniCompany;				
		}		
	}// setUserCompany()
	
	
	
	
	
	/**
	 * Confirm the userid and company id 
	 * are set in the active_token tb table.
	 * Return Bool 
	 * TODO: Add a query filter and matching db field to 
	 *       Account for the Session_Id as well as coid and uid.
	 */
	public function tokenSet($uid, $cid ){
		
		 if( $this->connected = TRUE ){
			
		    // $db connection object is set
			// $query = "SELECT `id` FROM `active_token` WHERE `id_user` = $uid AND `coid_token` = $cid";
			// echo $query;
			 
			$query = 'SELECT COUNT(id) FROM `active_token` WHERE `id_user` = :uid AND `coid_token` = :cid';
			$q = $this->pdo->prepare($query);
			$q->bindParam(':uid', $uid, PDO::PARAM_INT);
			$q->bindParam(':cid', $cid, PDO::PARAM_INT);
			 
		
			if($q->execute()){				
				
				$row = $q->fetch(PDO::FETCH_ASSOC);
				
				// Was there a matching row in active_token for current user?
				if( $row["COUNT(id)"] > 0 ){
					//var_dump($row);
					//echo "Row id is ".$row['id']. " and column count is " .count($row);
					return true;	
					
				} else {
					//var_dump($row);
					//echo "zero columns found";
					return false;
				}
				
			} else {
				
				//query failed
				echo "Query failed: " . $query;
				return false;
			}
		    
		  }	else {	

		  // Return False
		  return false;
		}		
		
	}
	
	
	/**
	 * User successfully Authenticated or Logged Out. 
	 * @params int uid
	 * @params bool value markLoggedIn, set DB field 'loggedin' as 0 or 1 	
	 */
	public function updateLoggedInStatus($uid, $markLoggedIn = true){
		
		if( $this->connected = false ){
			if($this->pdo = parent::dbOpen('custo299_wipcalendar')){
				$this->connected = true;
			} else 
			{
				$this->connected = false;
				return null;
			}			
		} else 
		{
			if($markLoggedIn === true){
				$status = 1;
				
			} else
			{
				$status =0;				
			}
			$update_lastSeen = ", `lastSeen` = '".date('Y-m-d G:i:s', strtotime('now'))."'";
			$query = 'UPDATE `users` SET `loggedin` = :status'.$update_lastSeen.' WHERE `id` = :id';
			$q = $this->pdo->prepare($query);
			$q->bindParam(':status', $status, PDO::PARAM_INT);
			$q->bindParam(':id', $uid, PDO::PARAM_INT);
			if( $q->execute() ){			
				return $status;
			} else {
				return null;
			}	
		}
	}// updateLoggedInStatus()
	
	
	/* Return a list of logged in users in array format */
	/* @param $userID = int id of the currently-logged-in user making this request.*/
	public function getLoggedUsersList($userID){
		$userlist = array(); //init empty
		//if( $this->connected = TRUE ){

		
		//get now to operate against user's field 'lastSeen';
		//$now = ;
		$now = new DateTime("NOW");		
			/*	
			datetime->diff returns DateInterval obj, as:
			DateInterval Object
			( 
				[y] => 0 
				[m] => 0 
				[d] => 0 
				[h] => 0 
				[i] => 0 
				[s] => 0 
				[invert] => 0 
				[days] => 0 
			)
			*/
			
			$query = 'SELECT `id`, `username`,`email`,`role`, `lastSeen` FROM `users` WHERE `loggedin` = true';
			$stmt = $this->pdo->query($query);
			//$stmt->execute($query);			
		
		    //foreach user where loggedin == true, 
			//if currect timestamp - lastSeen = 2+ hrs, 
			//(a) remove each inactive user from the $query result,
			//and (b) mark loggedin false;	
			
		
			// //array(3) { ["username"]=> string(9) "Developer" ["email"]=> string(26) "chris@customsigncenter.com" ["role"]=> string(5) "admin" } 
			
			while( $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ){
				
				for($i=0;count($rows)>$i;$i++){	
					
					$lastActive = new DateTime($rows[$i]['lastSeen']);
					
					if($userID === $rows[$i]['id']){
						//THIS IS THE USER MAKING THIS REQUEST
						$rows[$i]['username'] = 'You';
						//do nothing.  do not update their loggin status; do not add them to the list of users to display.
						//unset($rows[$i]);
												
					} elseif($lastActive->diff($now)->h < 2 && $lastActive->diff($now)->days === (int) 0 ){							
						//been less than 2 hrs minutes (less than 1 day and less than 1hrs)				 						
							array_push($userlist,$rows);
					} else {										
						$this->updateLoggedInStatus($rows[$i]['id'], false);
					}	
					
				}				
			}				
			
			//return empty on sql failure or if no users logged in; otherwise a list of users in an array.
			return $userlist; 		

	}// getLoggedUsersList()	
	
	
}// Class userAuthenticate

?>