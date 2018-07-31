<?php

// disable caching
include "nocache.php";

if  (isset($_POST['reset_checkbox']) && $_POST['reset_checkbox'] === 'yes') { /*do nothing*/ }
else { header('Location:scores.php'); }

// create connection
include 'db.php';

// get the username
$username_key = "username";
$username_value = $_COOKIE[$username_key];

// set database table
$database_table = "scores";

// get all scores for username
$query = "SELECT * FROM $database_table WHERE $username_key='$username_value'";
$results = $mysqli->query($query);
if (!$results) { echo "ERROR: Could not perform query." . mysql_error() . "<br>"; }
$scores_state = $results->fetch_assoc();

// nullify all scores
foreach ($scores_state as $key => $value) {
  // skip username key
  if ($key === $username_key) { continue; }

  // nullify current score
  $query = "UPDATE $database_table SET $key = null WHERE $username_key='$username_value'";
  $results = $mysqli->query($query);
  if (!$results) { echo "ERROR: Could not perform query." . mysql_error() . "<br>"; }
}

// close connection
$mysqli->close();

// redirect to scores page
header('Location:scores.php');

?>