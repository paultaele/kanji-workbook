<?php

// create connection
include 'db.php';

// get the username
$username_key = "username";
$username_value = $_COOKIE[$username_key];

// get the form's username and password
$scores_state_string = trim($_REQUEST['hidden_scores_state_input']);
$scores_state = json_decode($scores_state_string);

// // get the update query string
// $output = "";
// foreach($scores_state as $key => $value)  {
//   echo $key . "=" . $value . "<br>";
// }

// query database
// TODO: expand beyond just "ch00"
$temp_key = "ch00";
$temp_value = round($scores_state->$temp_key);
$database_table = "scores";

// query the update request
$query = "UPDATE $database_table
  SET $temp_key = $temp_value 
  WHERE $username_key='$username_value'
";
$results = $mysqli->query($query);
if (!$results) { echo "ERROR: Could not perform query." . mysql_error() . "<br>"; }




// close connection
$mysqli->close();

// TODO: show scores.php

// // redirect to calling page
// header('Location:workbook.html');

?>