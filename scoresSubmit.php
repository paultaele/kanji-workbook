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

// retrieve the file and path name
$file_name = trim($_REQUEST['file_name_input']);
$sketch_file_name = "sketch" . $file_name;
$assessments_file_name = "assessment" . $file_name;
$sketch_path_name = __DIR__ . "/sketches/" . $sketch_file_name;
$assessments_path_name = __DIR__ . "/assessments/" . $assessments_file_name;

// retrieve the sketch and assessment data
$sketch_data = trim($_REQUEST['sketch_data_input']);
$assessment_data = trim($_REQUEST['assessment_data_input']);

// write contents to file
// source: https://www.w3schools.com/php/php_file_create.asp
$myfile = fopen($sketch_path_name, "w") or die("Unable to open file!");
$txt = $sketch_data;
fwrite($myfile, $txt);
$myfile = fopen($assessments_path_name, "w") or die("Unable to open file!");
$txt = $assessment_data;
fwrite($myfile, $txt);
fclose($myfile);

// set database table
$database_table = "scores";

// iterate through the scores
foreach($scores_state as $metric => $score) {

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

  // case: prior score exists and current score <= prior score -> skip
  if ($prior_score != null && $score <= $prior_score) { continue; }

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

// redirect to scores page
header('Location:scores.php');

?>