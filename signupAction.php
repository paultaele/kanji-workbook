<?php

// disable caching
include "nocache.php";

// get form's data
$signup_username = trim($_REQUEST['username_input']);
$signup_password = trim($_REQUEST['password_input']);
$signup_password2 = trim($_REQUEST['password2_input']);
$signup_code = trim($_REQUEST['code_input']);
$signup_challenge = trim($_REQUEST['challenge_input']);

// passwords are not identical => redirect to signup page
if ($signup_password !== $signup_password2) { header('Location:signup.php'); }

// code is correct => usertype is student
$signup_usertype = "guest";
if (strtolower($signup_code) === "maroon") { $signup_usertype = "student"; }

// challenge is incorrect => redirect to signup page
if (strtolower($signup_challenge) !== "tokyo") { header('Location:signup.php'); }

// create connection
include 'db.php';

// TODO: check username is unique
// incorrect: redirect to signup.php


// debug
echo $signup_challenge . " | " . $signup_password . " | " . $signup_password2 . " | " . $signup_code . " | " . $signup_challenge . "<br>";
echo "usertype: " . $signup_usertype . "<br>";

// close connection
$mysqli->close();

// TODO: success => redirect to workbook page

?>