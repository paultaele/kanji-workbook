<?php

// disable caching
include "nocache.php";

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
$scores = $results->fetch_assoc();

// close connection
$mysqli->close();

// convert scores to JSON and add to hidden state
$json_data = json_encode($scores);
$hidden = "hidden";
echo "<div $hidden><textarea id='scores_state_input' cols='50' rows='10'>$json_data</textarea><br></div>";

include "footer.php"

?>