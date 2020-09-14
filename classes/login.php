<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
</head>

<body>
<h5>Login to Manage the Web Calendar</h5>
<form method="post" post="<?= $_SERVER[PHP_SELF] ?>" name="login" id="loginform">
    <label for="username">Username (NOT case-sensitive)</label><br />
    <input type="text" name="username" id="username" required="required" /><br /><br />
    <label for="password">Password (case-sensitive)</label><br />
    <input type="password" name="password" id="password" required="required" /><br /><br />
	<input type="submit" value="submit" name="submit" />
</form>
</body>
</html>
<?php




session_start();
$_SESSION['username']= $username;
//redirect to "index.php?user=$username&auth=$authenticated" (true or false) from login.php
?>
 


