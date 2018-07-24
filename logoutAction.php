<?php

// set blank username cookie
setcookie("username", "", time() + 3600, "/", "localhost", 0);

// redirect to calling page
header('Location:index.html');

?>