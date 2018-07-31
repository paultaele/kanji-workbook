<?php

// disable caching
include "nocache.php";

ob_start();

// set blank username cookie
setcookie("username", "", time() + 3600, "/");

// redirect to calling page
header('Location:index.html');

?>