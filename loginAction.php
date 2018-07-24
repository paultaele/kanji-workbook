<?php

// get the form's username and password
$login_username = trim($_REQUEST['username_input']);
$login_password = trim($_REQUEST['password_input']);

// create connection
include 'db.php';

// get all results from 'accounts' database table
$database_table = "accounts";
$query = "SELECT * FROM " . $database_table;
$result = $mysqli->query($query);
if (!$result) { echo "<p>Error getting logins from the database: " . mysql_error() . "</p>"; }

// iterate through the database rows
$entry = mysqli_fetch_assoc($result); // get the first table entry
$success = false;
while ($entry) {
  // get the entry's username and password
  $entry_username = trim($entry['username']);
  $entry_password = trim($entry['password']);

  // get login success
  $login_success = $entry_username === $login_username && $entry_password === $login_password;

  // login success => break loop 
  if ($login_success) { break; }

  // get the next table entry
  $entry = mysqli_fetch_assoc($result);
}

// password matched
if ($login_success) {
  // debug
  echo "<p>login success!</p>";

  // create username cookie
  $cookie_name = "username";
  $cookie_value = $login_username;
  $cookie_time = time() + 3600;
  setcookie($cookie_name, $cookie_value, $cookie_time, "/", "localhost", 0); // 86400 = 1 day

  // close connection
  $mysqli->close();

  header('Location:workbook.html');
}

// case: password not matched 
else {

  // debug
  echo "<p>login fail!</p>";

  // delete username cookie
  $cookie_name = "username";
  $cookie_value = "";
  $cookie_time = time() - 3600;
  setcookie($cookie_name, $cookie_value, $cookie_time, "/", "localhost", 0); // 86400 = 1 day

  // close connection
  $mysqli->close();

  header('Location:index.html');
}

?>