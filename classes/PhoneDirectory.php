<?php

//phone directory display -- display, add, edit and save actions
require_once( dirname($_SERVER['DOCUMENT_ROOT']).'/classes/dbConnPDO.php');

class PhoneDirectory extends dbConnPDO {
	
	public $coid;
	public $currentEmplNumber;
	private $pdo;
	
	 function __construct(){
		//if coid not set: default to csc coid of 0
		$this->coid = ($_POST['coid'] === '' || $_POST['coid'] === NULL ? '0' : $_POST['coid']);
		
		$m = (string)$_POST['method'];
		
		$this->pdo = $this->dbOpen('custo299_wipcalendar');
		
		switch(strtolower($m)){
			case 'read':
				$this->read();
				break;
			case 'update':
				$this->update();
				break;
			case 'delete':
				$this->delete();
				break;
			case 'create':
				unset($_POST['method']);
				$this->create();
				break;
		}		
		 
	}
	
	//add a new record
	private function create(){
			
		$keys = '';
		$values = '';
		
		foreach($_POST as $k=>$v){
			
			$k = str_replace('new', '', $k);			
			
			$keys .= "`".$k."`,";
			
			//encapsulate strs only with quotes.
			$values .= (is_int($v) ? $v ."," : "'".$v."',");			
			
		}			
			
		//remove trailing comma's
		$keys = rtrim($keys, ',');
		$values = rtrim($values, ',');
		
		$stmt = $this->pdo->prepare("INSERT INTO directory (".$keys.") VALUES(".$values.")");		
		
		if( $stmt->execute() ) {
			$insertedID = $this->pdo->lastInsertId ( );
			exit( json_encode( array("msg" => $_POST['newname'] . ' Successfully Created.', "id" => $insertedID) ));
	
		} else {
			
			exit(json_encode( array("msg" =>'Failed to Create Record for '.$_POST['newname'])) );
		}
		
	}//create
	
	//read company for $this->company id; return list of employees
	private function read(){
		$ar = array();
		$employees = array();
		
		$coIDs = array();
		//$this->coid is a either a csv string of company id's or a str of a single id:
		//explode returns an array, even if the coid str does not contain the delimeter (,).
		$coIDs = explode(',',$this->coid);
		//array to hold each statement to run:
		$dbStatement = array();
		if(isset($coIDs[0])){
			//there's at least 1 company id to use in a db query:
			foreach($coIDs as $id){				
				
				$stmt = $this->pdo->prepare("SELECT * FROM `directory` WHERE `coid` = :coid ORDER BY `coid` ASC, `name` ASC");
				$stmt->bindParam(':coid', $id, PDO::PARAM_STR);
				
				if( $stmt->execute() ) {
					while ( $rows = $stmt->fetch(PDO::FETCH_ASSOC) ) {		
						array_push($employees, $rows);				
					}		

					// statement->free result, frees the memory associated with the result.
					//$rows->free_result();				

					} else {			
						$this->msg('');
					}	
			}
			
			echo json_encode($employees);
			exit;
		}	
			
		
	}//read	
	
	//update one phone directory record.
	//Expect POST elements: name (NOT NULL),ph,ext,cell,email,dept,method (update),id (directory tbl primary field)
	private function update(){
		
		if(isset($_POST['id']) && isset($_POST['name'])){
			
			$q = 'UPDATE `directory` SET ';
			$id=$_POST['id'];			
			$qEnd = ' WHERE `id` = ' . (integer) $_POST['id'];	
			unset($_POST['id']);
			unset($_POST['method']);
			$i=0;
			
			
			foreach( $_POST as $k=>$v  ){
				
				// place quotes only around string values in the query:				
				$quote = (is_string($v) ? "'" : "");			
				
				if($i===0){
					//first go thru should not have leading comma
					$q .=  "`".$k ."` = " .$quote . $v . $quote;
					
					
				} else {
					$q .=  ", `".$k. "` = " .$quote . $v . $quote;
					
				}
				
				$i++;				
			}	
			
			$q = $q.$qEnd;
			
			
			//echo json_encode($q); exit;			
			
			$statem = $this->pdo->prepare($q);
			
			if($statem->execute()){
				
				echo json_encode("Record Successfully Updated for employee id ". $id);
				
			} else {
				
				echo json_encode("Update Failed for employee id ". $id);
				
			}
			
			exit;
			
			
		
		} else {
			
			//min required fields not provided in the request.
			exit;
		}
		
	}
	
	
	//delete a record. post values are method, name, and id
	private function delete(){
		
		
		
		$stmt = $this->pdo->prepare("DELETE FROM directory WHERE `id` = :id");
		$stmt->bindParam(':id', $_POST['id'], PDO::PARAM_INT);
		
		
		if( $stmt->execute() ) {
			
			exit( json_encode( array("msg" => $_POST['name'] . ' Successfully Removed.') ));
	
		} else {
			
			exit(json_encode( array("msg" =>'Failed to Remove '.$_POST['name'])) );
		}
	
	}//delete	
	
	private function msg( string $msg, bool $exit ){
		
		$m = array('msg'=>$msg);
		if($exit === true){
			echo json_encode ($m);
			exit;
		} else {
			return $m;
		}
	}
	
	//run a query.  returns a result or false on failure.
	private function runQuery($statem){
		
		return $this->mysql->query($statment, MYSQLI_USE_RESULT);
		
	}
	
}//class



$d=new PhoneDirectory;

















?>