<?php include "nocache.php" ?>
<!DOCTYPE html>
<html lang="en">

<!-- head -->
<head>
  <meta charset="UTF-8">
  <title>Kanji Workbook</title>
  <script type="text/javascript" src="scores.js"></script>
  <link rel="stylesheet" type="text/css" href="scores.css">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
</head>

<!-- body -->
<body onload="init();">

  <!-- header area -->
  <div id="header_area" class="centere">

    <!-- header message -->
    <span id="header_message"></span>
      
    <!-- menu options-->
    <form id="header_options">
      <input type="submit" value="Scores" formaction="scores.php" formmethod="get">
      <span>|</span>
      <input type="submit" value="Sign Out" formaction="logoutAction.php" formmethod="get">
    </form>

  </div>

  <!-- main display area -->
  <div id="main_display_area">
    
    <input type="submit" id="return_button" name="return_button" class="element_look"
      onclick="returnButton();" value="Return">

    <?php include 'scoresLookup.php';?>

    <div id="scores_display_area" name="scores_display_area"></div>
  </div>

  <!-- reset scores area -->
  <div id="reset_scores_area">
    <br><br>
    
    <form>
      Reset scores?
      <input type="checkbox" name="reset_checkbox" value="yes">
      <input type="submit" name="reset_button" value="OK" formaction="scoresReset.php" formmethod="post">
    </form>
  </div>

</body>
</html>