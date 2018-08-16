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

      <form id="login_form">

        <fieldset id="fieldset_area">
          <!-- legend -->
          <legend>Sign Up Details</legend>

          <!-- username input -->
          <!-- <label for="username_input">Enter Username:<sup>*</sup></label>
          <input type="text" id="username_input" name="username_input" required> -->

          <!-- generate username submit and input -->
          <label id="username_label" for="username_input" class="generate_label">Generate Username:<sup>*</sup></label><br>
          <input type="text" id="username_input" class="generate_input" name="username_input" readonly><br>
          <input type="button" id="username_button" class="generate_button" value="Generate" onclick="generateUsername();">

          <br><br>

          <!-- generate password submit and input -->
          <label id="password_label" for="password_input" class="generate_label">Generate Password:<sup>*</sup></label><br>
          <input type="text" id="password_input" class="generate_input" name="password_input" readonly><br>
          <input type="button" id="password_button" class="generate_button" value="Generate" onclick="generatePassword();">

          <br><br>

          <!-- invite code input -->
          <label for="code_input">Enter Invite Code:</label>
          <input type="password" id="code_input" name="code_input">

          <br><br>

          <!-- challenge input -->
          <label id="challenge_label" for="challenge_input">Challenge:
            <span style="font-weight: normal;">What is the capital of Japan?:</span><sup>*</sup>
          </label><br>
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