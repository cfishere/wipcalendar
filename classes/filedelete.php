<?php
//delete a file from the server::param is a path

		//ajax json param 'file':  'csv/[filename.csv]' 
		//is appended as $_POST['file']

		
		//$approot can incl the /dev directory or not.
        $approot = $_SERVER['SCRIPT_FILENAME'];
		//EX $approot = "/home/custo299/public_html/calendar/classes/filedelete.php"
		$pos = strpos($approot, 'classes/');
		$approot = substr($approot, 0, $pos);
		//expecting this to produce: 	  
			//  "/home/custo299/public_html/calendar/  or in development site case:
			//  "/home/custo299/public_html/calendar/dev/ 
			//  and adding onto it: 'csv/[filename.csv]'
			//  will give us the full path to the file targeted in the deletion.
			  
			  
			//  "/home/custo299/public_html/calendar/";		
		$file = $approot.(string)$_POST['file'];
		//print_r($_POST);
		//echo $file;

		chmod($approot."csv", 0777);
		
		//echo 'the del function fired';
		if(is_file($file)) {
		    chmod($file, 0777);
		    if(unlink($file)){
			    $msg = json_encode("File has been deleted.");
			    echo $msg;
			     chmod($approot."csv", 0755);
		    }else{
			   $msg = json_encode("File was not deleted.");
			   echo $msg;
			   chmod($approot."csv", 0755);
		    }
		    exit;
		} else {
			$msg = json_encode("File not found.  Perhaps it has already been deleted.");		
			echo $msg;	
		}
		if(is_file($file)) {
			chmod($file, 0755);
		}
		if(is_dir($approot."csv")){
			chmod($approot."csv", 0755);
		}

?>