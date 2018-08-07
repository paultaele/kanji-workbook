<?php

// disable caching
include "nocache.php";

// create connection
include 'db.php';

// get the username and usertype
$username_key = "username";
$usertype_key = "usertype";
$username_value = $_COOKIE[$username_key];
$usertype_value = $_COOKIE[$usertype_key];

// usertype not instructor => redirect to workbook page
if ($usertype_value !== "instructor") { header('Location:workbook.html'); }

// set database table
$database_table = "scores";

// get entire gradebook, assorted by username
$query = "SELECT * FROM $database_table ORDER BY username ASC";
$results = $mysqli->query($query);
if (!$results) { echo "ERROR: Could not perform query." . mysql_error() . "<br>"; }

// TODO: make while loop for iterating through results
// $gradebook = $results->fetch_assoc();

// get the gradebook
$gradebook = [];
while( $row = $results->fetch_assoc() ) { $gradebook[] = $row; }

// close connection
$mysqli->close();

// convert scores to JSON and add to hidden state
$json_data = json_encode($gradebook);
// $hidden = "hidden";
$hidden = "";
echo "<div $hidden><textarea id='gradebook_input' cols='50' rows='10'>$json_data</textarea><br></div>";

?>