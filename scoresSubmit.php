<?php

// disable caching
include "nocache.php";

// create connection
include 'db.php';

// get the username
$username_key = "username";
$username_value = $_COOKIE[$username_key];

// retrieve and decode the scores state input
$scores_state_input = trim($_REQUEST['scores_state_input']);
$scores_state = json_decode($scores_state_input);

// set database table
$database_table = "scores";

// iterate through the scores
foreach($scores_state as $metric => $score)  {
  // case: score is null -> skip
  if ($score === null) { continue; }
  
  // get prior score
  $query = "SELECT $metric
    FROM $database_table
    WHERE $username_key='$username_value'
  ";
  $results = $mysqli->query($query);
  if (!$results) { echo "ERROR: Could not perform query." . mysql_error() . "<br>"; }
  $prior_scores = $results->fetch_assoc();
  $prior_score = $prior_scores[$metric];

  // case: current score <= prior score -> skip
  if ($score <= $prior_score) { continue; }

  // update to new score
  $query = "UPDATE $database_table
    SET $metric = $score
    WHERE $username_key='$username_value'
  ";
  $results = $mysqli->query($query);
  if (!$results) { echo "ERROR: Could not perform query." . mysql_error() . "<br>"; }
}

// close connection
$mysqli->close();

// // display scores
// include "scores.php";

// // redirect to scores page
header('Location:scores.php');

?>