<?php include "nocache.php" ?>
<!DOCTYPE html>
<html lang="en">

<!-- head -->
<head>
  <meta charset="UTF-8">
  <title>Kanji Workbook</title>
  <script type="text/javascript" src="gradebook.js"></script>
  <link rel="stylesheet" type="text/css" href="scores.css">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
</head>

<!-- body -->
<body onload="init();">

  <!-- header area -->
  <div id="header_area" class="center">

    <!-- header message -->
    <span id="header_message"></span>
      
    <!-- header options-->
    <form id="header_options">
      <input type="submit" id="gradebook_link" value="Gradebook" formaction="gradebook.php" formmethod="get">
      <span id="gradebook_divider">|</span>
      <input type="submit" value="Scores" formaction="scores.php" formmethod="get">
      <span>|</span>
      <input type="submit" value="Sign Out" formaction="logoutAction.php" formmethod="get">
    </form>

  </div>

  <!-- main display area -->
    <div id="main_display_area">

      <input type="submit" id="return_button" name="return_button" class="element_look"
        onclick="returnButton();" value="Return">

      <?php include 'gradebookLookup.php';?>

      <div id="gradebook_display_area" name="gradebook_display_area"></div>

    </div>

</body>
</html>