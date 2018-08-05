<?php

// disable caching
include "nocache.php";

// get the form's username, password, and usertype
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
$login_usertype = null;
while ($entry) {
  // get the entry's username and password
  $entry_username = trim($entry['username']);
  $entry_password = trim($entry['password']);
  $entry_usertype = trim($entry['usertype']);

  // get login success
  $login_success = $entry_username === $login_username && $entry_password === $login_password;

  // login success => also get usertype and break loop 
  if ($login_success) {
    $login_usertype = $entry_usertype;
    break; 
  }

  // get the next table entry
  $entry = mysqli_fetch_assoc($result);
}

// close connection
$mysqli->close();

// password matched
if ($login_success) {
  
  // create username cookie
  $cookie_name = "username";
  $cookie_value = $login_username;
  $cookie_time = time() + 3600;
  setcookie($cookie_name, $cookie_value, $cookie_time, "/"); // 86400 = 1 day

  // create usertype cookie
  $cookie_name = "usertype";
  $cookie_value = $login_usertype;
  $cookie_time = time() + 3600;
  setcookie($cookie_name, $cookie_value, $cookie_time, "/"); // 86400 = 1 day

  // redirect to workbook page
  header('Location:workbook.html');
}

// case: password not matched 
else {
  // delete username cookie
  $cookie_name = "username";
  $cookie_value = "";
  $cookie_time = time() - 3600;
  unset($_COOKIE["username"]);
  setcookie($cookie_name, $cookie_value, $cookie_time, "/"); // 86400 = 1 day

  // delete usertype cookie
  $cookie_name = "usertype";
  $cookie_value = "";
  $cookie_time = time() - 3600;
  unset($_COOKIE["usertype"]);
  setcookie($cookie_name, $cookie_value, $cookie_time, "/"); // 86400 = 1 day

  // redirect to index page
  header('Location:index.html');
}

?>