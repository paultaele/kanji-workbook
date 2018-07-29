<!-- <?php

?> -->

<html lang="en">
  <head>
    <title>Kanji Workbook - Scores</title>
    <script type="text/javascript" src="scores.js"></script>
    <link rel="stylesheet" type="text/css" href="scores.css">
  </head>

  <body onload="init();" background="bg_grey.gif">

    <!-- menu area -->
    <div id="header_content">

      <!-- header message -->
      <span id="header_message">Hello</span>
        
      <!-- menu options-->
      <form id="header_options">
        <input type="submit" value="Scores" formaction="scores.php" formmethod="get">
        <span>|</span>
        <input type="submit" value="Sign Out" formaction="logoutAction.php" formmethod="get">
      </form>

    </div>
    
    <!-- return button -->
    <div>
      <input type="submit" id="return_button" class="elementlook" name="return_button"
        value="Return" onclick="returnButton();"
      >
    </div>
  
    <div>
      <h1>Hello</h1>
    </div>

  </body>

</html>