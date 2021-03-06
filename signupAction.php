<?php

// disable caching
include "nocache.php";

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Kanji Workbook</title>
    <script type="text/javascript" src="signup.js"></script>
    <link rel="stylesheet" href="signup.css">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
  </head>

  <body> 
  <!-- <body onload="init();"> -->

    <br><br><br>

    <h1>Kanji Workbook</h1>

    <?php

    // get form's data
    $signup_username = trim($_REQUEST['username_input']);
    $signup_password = trim($_REQUEST['password_input']);
    $signup_firstname = trim($_REQUEST['firstname_input']);
    $signup_lastname = trim($_REQUEST['lastname_input']);
    $signup_course = $_GET['course_input'];
    $signup_semester = trim($_REQUEST['year_input']) . $_GET['semester_input'];
    // $signup_semester = $_GET['semester_input'];
    // $signup_code = trim($_REQUEST['code_input']);
    $signup_challenge = trim($_REQUEST['challenge_input']);
    $signup_usertype = "student";

    // username is empty => redirect to signup page
    if ($signup_username === "") {
      header('Location:signup.php');
      exit;
    }

    // password is empty => redirect to signup page
    if ($signup_password === "") {
      header('Location:signup.php');
      exit;
    }

    // challenge is incorrect => redirect to signup page
    if (strtolower($signup_challenge) !== "tokyo") {
      header('Location:signup.php');
      exit;
    }

    // create connection
    include 'db.php';

    // get all results from 'accounts' database table
    $database_table = "accounts";
    $query = "SELECT * FROM " . $database_table;
    $result = $mysqli->query($query);
    if (!$result) { echo "<p>Error getting logins from the database: " . mysql_error() . "</p>"; }

    // check if signup username does not already exist in accounts database
    while ($entry = mysqli_fetch_assoc($result)) {
      // get the entry's username
      $entry_username = trim($entry['username']);

      // get login success
      if ($entry_username === $signup_username) {
        // close connection and redirect to signup page
        $mysqli->close();
        header('Location:signup.php');
        break;
      }
    }

    // add new account to database table
    // username | password | usertype | firstname | lastname | course | semester
    $query = "INSERT INTO $database_table
      (username, password, usertype, firstname, lastname, course, semester)
      VALUES
      ('$signup_username', '$signup_password', '$signup_usertype', '$signup_firstname', '$signup_lastname', '$signup_course', '$signup_semester')
    ";
    $result = $mysqli->query($query);
    if (!$result) { echo "<p>Error getting $database_table from the database: " . mysql_error() . "</p>"; }

    // display account details
    echo "<style>";
    echo ".large_text_look { font-size: 2em; }";
    echo ".small_text_look { font-size: 1.5em; }";
    echo ".red_look { color: red; }";
    echo "</style>";
    echo "<fieldset id='fieldset_area'>";
    echo "<legend class='large_text_look'>Account Details</legend>";
    echo "<span class='small_text_look'>Below are your login credentials.</span><br>";
    echo "<span class='small_text_look red_look'><strong>Do not forget this information!</strong></span><br><br>";
    echo "<span class='large_text_look'><strong>username:</strong> " . $signup_username . "</span>";
    echo "<br>";
    echo "<span class='large_text_look'><strong>password:</strong> " . $signup_password . "</span>";
    echo "<br><br>";
    echo "<span class='small_text_look'>Click <a href='index.php'>here</a> to log in.</span>";
    echo "</fieldset>";

    // close connection
    $mysqli->close();

    ?>

    <?php include "footer.php" ?>

  </body>
</html>