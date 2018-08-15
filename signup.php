<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Kanji Workbook</title>
    <!-- <script type="text/javascript" src="signup.js"></script> -->
    <link rel="stylesheet" href="signup.css">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
  </head>

  <body> 
  <!-- <body onload="init();"> -->

    <br><br><br>

    <h1>Kanji Workbook</h1>

      <form id="login_form">

        <fieldset id="form_area">
          <!-- legend -->
          <legend>Sign Up Details</legend>

          <!-- username input -->
          <label for="username_input">Enter Username:<sup>*</sup></label>
          <input type="text" id="username_input" name="username_input" required>

          <br><br>

          <!-- password input -->
          <label for="password_input">Enter Password:<sup>*</sup></label>
          <input type="password" id="password_input" name="password_input" required>

          <br><br>

          <!-- repeat password input -->
          <label for="password2_input">Re-Enter Password:<sup>*</sup></label>
          <input type="password" id="password2_input" name="password2_input" required>

          <br><br>

          <!-- invite code input -->
          <label for="code_input">Enter Invite Code:</label>
          <input type="password" id="code_input" name="code_input">

          <br><br>

          <!-- challenge input -->
          <label id="challenge_label" for="challenge_input">Challenge:
            <span style="font-weight: normal;">What is the capital of Japan?:</span><sup>*</sup></label><br>
          <input type="text" id="challenge_input" name="challenge_input">

          <br><br>

          <!-- submit button -->
          <input type="submit" id="submit_button"
            name="submit_button" value="Sign Up" formaction="signupAction.php" formmethod="get">

        </fieldset>
        
      </form>

      <span style="font-size: 1em"><strong>*: required</strong></span>

    <?php include "footer.php" ?>

  </body>
</html>