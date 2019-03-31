<?php

// disable caching
include "nocache.php";

// get form's username and password
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
$success = false;
$login_usertype = null;
while ($entry = mysqli_fetch_assoc($result)) {
  // get the entry's contents
  $entry_username = trim($entry['username']);
  $entry_password = trim($entry['password']);
  $entry_usertype = trim($entry['usertype']);
  $entry_firstname = trim($entry['firstname']);
  $entry_lastname = trim($entry['lastname']);
  $entry_course = trim($entry['course']);

  // get login success
  $login_success = $entry_username === $login_username && $entry_password === $login_password;

  // login success => also get usertype and break loop 
  if ($login_success) {
    $login_usertype = $entry_usertype;
    $login_firstname = $entry_firstname;
    $login_lastname = $entry_lastname;
    $login_course = $entry_course;
    break; 
  }
}

// case: password not matched => redirect to login page and exit script
if (!$login_success) {
  // close connection
  $mysqli->close();

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
  header('Location:index.php');
  exit;
}

// add username and usertype to cookie
setcookie("username", $login_username, time() + 3600, "/"); // 86400 = 1 day
setcookie("usertype", $login_usertype, time() + 3600, "/"); // 86400 = 1 day
setcookie("firstname", $login_firstname, time() + 3600, "/"); // 86400 = 1 day

// add scores row for new non-guest usertypes
if ($login_usertype !== "guest") {
  // get the scores table
  $database_table = "scores";
  $query = "SELECT * FROM " . $database_table;
  $result = $mysqli->query($query);
  if (!$result) { echo "<p>Error getting scores from the database: " . mysql_error() . "</p>"; }

  // check if username exists
  $found_flag = false;
  while ($entry = mysqli_fetch_assoc($result)) {
    // get the entry's username
    $entry_username = trim($entry['username']);

    // login username matches entry username => enable found flag and quit loop
    if ($login_username === $entry_username) {
      $found_flag = true; 
      break;
    }
  }

  // username not found in scores table => add new row with username and usertype
  $database_table = "scores";
  if (!$found_flag) {
    $query = "INSERT INTO $database_table
      (username, usertype, firstname, lastname, course)
      VALUES
      ('$login_username', '$login_usertype', '$login_firstname', '$login_lastname', '$login_course')
    ";
    $result = $mysqli->query($query);
    if (!$result) { echo "<p>Error getting scores from the database: " . mysql_error() . "</p>"; }
  }
}

// close connection
$mysqli->close();

// redirect to workbook page
header('Location:workbook.php');

?>