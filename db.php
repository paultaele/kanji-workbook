<?php

$mysqli_servername = "localhost";
$mysqli_username = "kanjiwor_WPJCF";
$mysqli_password = "T34gu3@330";
$mysqli_database = 'kanjiwor_WPJCF';

// create connection
$mysqli = new mysqli($mysqli_servername, $mysqli_username, $mysqli_password, $mysqli_database);

// check connection
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

?>