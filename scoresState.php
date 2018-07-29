<?php

// create connection
include 'db.php';

// get the username
$username_key = "username";
$username_value = $_COOKIE[$username_key];

// set database table
$database_table = "scores";

// get all scores for username
$query = "SELECT *
  FROM $database_table
  WHERE $username_key='$username_value'
";
$results = $mysqli->query($query);
if (!$results) { echo "ERROR: Could not perform query." . mysql_error() . "<br>"; }

//
$record = $results->fetch_assoc();

// --------------------------------------------------

// 1. Create JSON object.
// 2. Retrieve contents from mysql database.
// 3. Store contents into hidden form.

// debug
$dummy = $temp["ch00"];

// --------------------------------------------------

// test
echo "<div><textarea id='test_element' cols='50' rows='10'>$dummy</textarea><br></div>";

?>