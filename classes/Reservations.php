<?php

require_once( __DIR__ . '/db.php' ); //db manager class

class Reservations extends Db {
	
	protected $pdoCx;
	protected $schedToday;
	protected $d;
	protected $reservations = array(); //the db's reservations->schedule
	protected $timeTable = array();
	protected $htmlTimeTable = '';
	protected $startTimes = array();
	
	public function __construct(){
		//echo json_encode('HELLO');
		//set db connection ojbect
		$this->pdoCx = parent::manage( 'open', 'custo299_wipcalendar' );
		
		if(!is_object($this->pdoCx)) { exit("Cannot Connect to Database.  Exiting.");}
		
		//$this->d = date( 'Y-m-d', strtotime('today') );
		
		//array representation of the time slots used to build the html structure.
		//$this->timeTable = $this->makeTimeTable();		
		
			
		$this->startTimes = array(
			
			'800' => array('user'=> array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'830'),

			'830' => array('user'=> array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'900'),

			'900' => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'930'),

			'930'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'1000'),

			'1000'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'1030'),

			'1030'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'1100'),

			'1100'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'1130'),

			'1130'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'1200'),

			'1200'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'1230'),

			'1230'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'100'),

			'100'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'130'),

			'130'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'200'),

			'200'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'230'),

			'230'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'300'),

			'300'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'330'),

			'330'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'400'),

			'400'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'430'),

			'430'  => array('user'=>array('id'=>'', 'name'=>''), 'desc'=>'', 'endTime'=>'500')

		);
		
		
		
		
		switch ($_POST['method']){
			case "load":							
				$this->loadDate();
				break;
			case "new":
				$this->addNew();
				break;
			default: $this->loadSched();	
				break;
				
		}	
		
		
	}
	
	// model that returns reservations table by date & company			
	private function getSchedule(){
		
		$q = "SELECT * FROM `reservations` WHERE `date` = :date AND `id_company` = :company";
		
		$stmt = $this->pdoCx->prepare($q);
		
		$stmt->bindParam(':date',$_POST['date'], PDO::PARAM_STR);
		$stmt->bindParam(':company',$_POST['company'], PDO::PARAM_STR);
		
		$stmt->execute();
		
		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		
		$r=unserialize($result);
			
		//$rawSched = unserialize($row['schedule']);
		exit(json_encode($r));	
		
		
	}
	
	//initial load of a default schedule for first page by user:
	// ajax post data: 'date':today,'company':'0','method':'loadSched'			
	private function loadSched(){
		$r = array();
		$q = "SELECT * FROM `reservations` WHERE `date` = :date AND `id_company` = '0'";
		
		$stmt = $this->pdoCx->prepare($q);
		
		$stmt->bindParam(':date',$_POST['date'], PDO::PARAM_STR);
		//$stmt->bindParam(':company','0', PDO::PARAM_STR);
		
		$stmt->execute();
		if( $stmt->rowCount() > 1  ){
			$result = $stmt->fetch(PDO::FETCH_ASSOC);

			$r=unserialize( $result );

			//$rawSched = unserialize($row['schedule']);
		    echo json_encode( $r );	
		} 
		
		exit();
		
		
	}
	
	
	
	
	//add a reservation to the schedule.
	//Required Ajax variables are (user)id, (user)name, company, date, time ('8:30'), method ('new'), desc
	private function addNew(){
		
		//query if a reservation has already occupied this date and time slot.
		//get the desired schedule and convert to an array.
				
		$q = "SELECT `schedule`,`id` FROM `reservations` WHERE `date` = '" . (string)$_POST['date'] . "' AND `id_company` = '" .
			(string)$_POST['company'] ."'";
		
		$stmt = $this->pdoCx->prepare($q);
		
		$stmt->execute();
		
		// INSERT new reservation if date is found in db, and if the requested time slot is open; 
		// else create new record with the requested reservation included.
		
		if( $stmt->rowCount() === 1  ){
			
			$sched = $stmt->fetch(PDO::FETCH_ASSOC); //sched['id'](int), sched['schedule'](serialized)
			
			$arSched = unserialize($sched['schedule']);
			
			//check if reservation already claimed for requested date/time/company
			
			if(empty( $arSched[(string)$_POST['time']]['user']['id'] )){
				
				
				//timeslot is open for our new reservation: do an UPDATE.
				
				$arSched[ (string)$_POST['time'] ]['user']['id'] = (string)$_POST['id'];//user id
				$arSched[ (string)$_POST['time'] ]['user']['name'] = $_POST['name']; //user's greeting name
				$arSched[ (string)$_POST['time'] ]['desc'] = $_POST['desc']; //optional description of reservation activity		
				$serSched = serialize($arSched);
				
				$stmt = $this->pdoCx->prepare( "UPDATE `reservations` SET `schedule` = :sched WHERE `id` = :id"  );
						
				$stmt->bindParam(':sched', $serSched, PDO::PARAM_STR);
				$stmt->bindParam(':id', $sched['id'], PDO::PARAM_INT);
				
				
				$stmt->execute();				
				
				if( $stmt->rowCount() === 0 ){					
					$m = json_encode('The reservation '.$_POST['date']. ' at ' .
					$_POST['time'] .' could not be completed; the database responded with 0 changes.');
					unset($stmt);
					exit($m);
				}
				unset($stmt);
				
				//TODO: close db connection
				
				$m = json_encode('Your reservation request completed successfully for ' .$_POST['date']. ' at ' . $_POST['time']);
				exit($m);
				
			} else {
				
				$m = json_encode('That date and time are already reserved.  Pick a different time slot.');
				exit($m);
				
			}
			
				
		} else {
			
			//there is no db record for the requested date/company, so create it with the reservation info included.
			
			$t = $_POST['time'];
			unset($stmt);
			
			$this->startTimes[ $t ]['user']['id'] = $_POST['id'];
			$this->startTimes[ $t ]['user']['name'] = $_POST['name'];
			$this->startTimes[ $t ]['desc'] = $_POST['desc'];	
			print_r($this->startTimes);
			$serSched = serialize($this->startTimes);
			$q = "INSERT INTO `reservations` 
				( `date`,`schedule`,`id_company`)  VALUES(:date, :sched, :co)";
			//echo $q;
			$stmt = $this->pdoCx->prepare($q);
			$stmt->bindParam(':date', $_POST['date'], PDO::PARAM_STR);
			$stmt->bindParam(':sched', $serSched, PDO::PARAM_STR);
			$stmt->bindParam(':co', $_POST['company'], PDO::PARAM_STR);
			$stmt->execute();
			
			if( $stmt->rowCount() === 0 ){					
				$m = json_encode('The reservation '.$_POST['date']. ' at ' . $_POST['time'] .
							  ' could not be completed; the database responded with 0 changes.');
				unset($stmt);
				exit($m);
			}
			
			unset($stmt);

			//TODO: close db connection

			$m = json_encode('Your reservation request completed successfully for ' .$_POST['date']. ' at ' .$_POST['time']);
			exit($m);
			
		}
		
	}
	
	// return array of military format time slots from 7am - 5pm (17:00)
	private function makeTimeTable(){
		
		$a=array();
		
		for( (float)$i=7; $i<=17; $i+0.5 ){
			
			if( $i === (float)12 ){
				array_push( $a, array( 'time'=>'Noon','reservation'=>'') );
			} 
			else {
				$hr = (string)floor($i);
				( ($i - floor($i) > 0 ) ) ? $min = ':30' : $min = ':00';

				array_push( $a, array( 'time' => $hr.$min, 'reservation' => '' ) );
			}			
		}
		
		return $a;
		
	}
	
	
	/* build the HTML structure for the time slots, inserted sched data $row */
	private function makeHTMLtable(){
		
		
		$de = '&lt;/div$gt;';		
		$this->htmlTimeTable .= '&lt;div id=&quot;schedule&quot;&gt;';
		
		foreach($this->timeTable as $t){
			
			$d = '&lt;div class=&quot;unit&quot; id=&quot;t_'.$t['time'].'&quot; &gt;';
			
			$s = '&lt;span class=&quot;time&quot;&gt;'.$t['time'].'&lt;/div$gt;'.$t['reservation'];
			$this->htmlTimeTable .= $d.$s.$de;
			
		}
		
		$this->htmlTimeTable .= '&lt;/div$gt;';
	}	
	
	
	
	/*******************   DATABASE QUERY FUNCTIONS  **********************/
	//a select query; returns false or the db members on success.
	private function fetchAll($q){
		
		
		
		return $result;
		
	}
	
	//delete query; returns true if success, otherwise false;
	private function delete($q){
		
		
		
		return $result;
		
	}
	
	//delete query; returns true if success, otherwise false;
	private function insert($q){
		
		
		
		return $result;
		
	}
	
	private function fetchByUser($q){
		
		return $result;
	}
	
	
	
	
}



/* tables
	reservations fields id,date,schedule
		WHERE schedule is serialized array containing date=>2017-1-31 (containing) 
		      coid=>company id int, (containing) users=>userid int, numeric indexed array of reservations, like: 
			 0 = array(s=>startHr int, smin=>startMin int, e=>endHr int, emin=> for=>str user's description 
			 like 'Permits')
			 
	users fields id,username,password,email,role,company
	
	serialized reservations array looks like this in the db:
	a:18:{i:800;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"830";}i:830;a:3:{s:4:"user";a:2:{s:2:"id";s:1:"1";s:4:"name";s:5:"chris";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"900";}i:900;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"930";}i:930;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:4:"1000";}i:1000;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:4:"1030";}i:1030;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:4:"1100";}i:1100;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:4:"1130";}i:1130;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:4:"1200";}i:1200;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:4:"1230";}i:1230;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"100";}i:100;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"130";}i:130;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"200";}i:200;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"230";}i:230;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"300";}i:300;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"330";}i:330;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"400";}i:400;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"430";}i:430;a:3:{s:4:"user";a:2:{s:2:"id";s:0:"";s:4:"name";s:0:"";}s:4:"desc";s:0:"";s:7:"endTime";s:3:"500";}}
*/

$c = new Reservations();

?>
