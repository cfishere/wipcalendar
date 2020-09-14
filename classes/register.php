<?php
//register a new user with bcrypt hash password in wipcalendar database.
libxml_use_internal_errors(true);
//include by session.php: '../../../classes/dbConnPDO.php';
include('session.php');
class register extends Session {	
	
	// Properties
	public $pdo;
	public $uUsername;
	public $uPassword;
	public $uPasswordEncrypted;	
	public $uCompany;
	public $connected; // bool status of db connection
	public $userMessage;
	public $uEmail;
	public $uRole;
	public $status;
	
	//public $problem; //bool whether user acct was created.
	
	// connect to db; assign POST variables to Class Properties
	public function __construct(){	
		parent::__construct();

				
		// connect to the database
		if(	$this->pdo = parent::dbOpen('custo299_wipcalendar')){//open connection to wipcalendar db.
			$this->connected = TRUE;
			$this->userMessage .= "Connected to Db. \r\n";
			
		} else {
			$this->connected = FALSE;				
		}
		
	}
	
	public function save(){
		$this->uUsername = $_POST['username'];
		$this->uPassword = $_POST['password'];		
		$this->uEmail = stripslashes($_POST['email']);
		//Comapany DB value can be 0 - 4 or 'ALL'.  Leave empty if not specified:
		//if they user does not select any of the options, defaults to 'none':		
		$this->uCompany = ( $_POST['company'] == 'none' ? '' :  $_POST['company']);
		$this->uRole = $_POST['role'];
		$this->uPasswordEncrypted = password_hash ( $this->uPassword, PASSWORD_BCRYPT );
		
		// *** 1st: Ensure the username is unique ***//
		// ******************************************//
		// Use Prepared Statement, employ PDO placeholders :name for Query variables to guard against sql injections:
		$stmt = $this->pdo->prepare('SELECT `username` from users WHERE `username` = :username LIMIT 1' );
		//execute the query, passing in the variables.			
		$stmt->execute(['username' => $this->uUsername]);
		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		if( $result['username'] ) {	//username is taken; output msg to user.			
			$this->userMessage .= "The username '".$this->uUsername."' is already used. Try a different one.";
			$this->status = false;			
		} else { 
			// save a new user account.
			$stmt = $this->pdo->prepare('INSERT INTO users (`username`, `password`, `email`, `company`, `role`) values ( :username, :password, :email, :company, :role)');
			$stmt->execute( ['username' => $this->uUsername, 'password' => $this->uPasswordEncrypted, 'email' => $this->uEmail, 'company' => $this->uCompany, 'role' => 'user' ] );
			// was record created?
			if($id = $this->pdo->lastInsertId()){
				// Does the username for the id retrieved matche the username submitted in this last insert request
				
				$stmt = $this->pdo->prepare('SELECT * FROM users WHERE `username` = :username AND `id` = :id LIMIT 1' );
				$res = $stmt->execute( ['username' => $this->uUsername, 'id' => $id] );
				$this->userMessage .= "<br>Registered new User ".$this->uUsername." with password ". $this->uPassword." comp was ".$_POST['company'];
				if( $stmt->rowCount() === 1 ){
					$this->status = true;					
				} else {
					$this->status = false;
				}			
				
			}		
			
		}		
	}
	
}