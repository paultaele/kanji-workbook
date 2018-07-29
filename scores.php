<!DOCTYPE html>
<html lang="en">

<!-- head -->
<head>
  <meta charset="UTF-8">
  <title>Kanji Workbook</title>
  <script type="text/javascript" src="scores.js"></script>
  <link rel="stylesheet" type="text/css" href="scores.css">  
</head>

<!-- body -->
<body onload="init();" background="bg_grey.gif">

  <!-- header area -->
  <div id="header_content">

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

    <div id="score_display_area" name="score_display_area">
      
      <?php include 'scoresState.php';?>

      <span>Scores</span>


    </div>

  </div>
  
</body>
</html>