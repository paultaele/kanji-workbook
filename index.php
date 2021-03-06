<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Kanji Workbook</title>
    <script type="text/javascript" src="index.js"></script>
    <link rel="stylesheet" href="index.css">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
  </head>

  <body onload="init();">

    <br><br><br>

    <h1>Kanji Workbook</h1>

    <form id="login_form">

      <fieldset id="fieldset_area">

        <!-- legend -->
        <legend>Log In</legend>

        <!-- username input -->
        <label for="username_input"><span>Username:</span></label>
        <input type="text" id="username_input" name="username_input" required>

        <br><br>
      
        <!-- password input -->
        <label for="password_input"><span>Password:</span></label>
        <input type="password" id="password_input" name="password_input" required>

        <br><br>

        <!-- submit button -->
        <input type="submit" id="submit_button"
          name="submit_button" value="Log In" formaction="loginAction.php" formmethod="get">

        <br><br>

        <!-- sign up link -->
        <span style="font-size: 0.75em"><a href="signup.php" style="text-decoration: none">Sign Up</a></span>

      </fieldset>

    </form>

    <?php include "footer.php" ?>

  </body>
</html>