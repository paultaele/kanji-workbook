<?php

$mysqli_servername = "localhost";
$mysqli_username = "paul";
$mysqli_password = "admin";
$mysqli_database = 'kanji_workbook';

// create connection
$mysqli = new mysqli($mysqli_servername, $mysqli_username, $mysqli_password, $mysqli_database);

// check connection
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

?>