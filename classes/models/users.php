<?php
use ..\namespace\{ClassA, ClassB, ClassC as C};




$sql = sprintf(
		"INSERT INTO %s (%s) values (%s)",
		"users", //the table name 1st position placeholder %s
		implode(", ", array_keys($new_user)), // 2nd position placeholder the column names
		":" . implode(", :", array_keys($new_user)) //3rd position, the PDO parameter names for assigning our values
);

//will output:
//INSERT INTO users (firstname, lastname, username, email, password, company, role, loggedin) values (:firstname, :lastname, :username, :email, :password, :company, :role, :loggedin )

//When:
$new_user = array(
	"firstname" => $_POST['firstname'],//str
	"lastname"  => $_POST['lastname'],//str
	"username"	=> $_POST['username'],//str
	"email"     => $_POST['email'],//str
	"password"  => $_POST['password'],//str brcrypt hash
	"company"  => $_POST['company'],//str
	"role"  => $_POST['role'],//str
	"loggedin"  => $_POST['loggedin']// tinyInt (convert to a str?)// on creating new, this can be skipped as null allowed, defaults to int 0
);



//while %s reserves a string, %d reserves an decimal value
/* This can be automated by sorting out the decimal and strings 
	in a foreach loop of the $_POST values using is_string()
	*/
// Source: http://php.net/manual/en/function.sprintf.php
/* Possible types:
% - a literal percent character. No argument is required.
b - the argument is treated as an integer and presented as a binary number.
c - the argument is treated as an integer and presented as the character with that ASCII value.
d - the argument is treated as an integer and presented as a (signed) decimal number.
e - the argument is treated as scientific notation (e.g. 1.2e+2). The precision specifier stands for the number of digits after the decimal point since PHP 5.2.1. In earlier versions, it was taken as number of significant digits (one less).
E - like %e but uses uppercase letter (e.g. 1.2E+2).
f - the argument is treated as a float and presented as a floating-point number (locale aware).
F - the argument is treated as a float and presented as a floating-point number (non-locale aware). Available since PHP 5.0.3.
g - shorter of %e and %f.
G - shorter of %E and %f.
o - the argument is treated as an integer and presented as an octal number.
s - the argument is treated as and presented as a string.
u - the argument is treated as an integer and presented as an unsigned decimal number.
x - the argument is treated as an integer and presented as a hexadecimal number (with lowercase letters).
X - the argument is treated as an integer and presented as a hexadecimal number (with uppercase letters).
*/

/* need tables for:
users = authentication for app access control, fk_empl_id points the employee's record, or null if not an employee record.
employees = contact info, company, dept, bday, title, etc.


*/

class Users extends Models {
	
	
	
	
	
	
	
}


