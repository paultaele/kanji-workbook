<!DOCTYPE html>
<html lang="en">

<!-- head -->
<head>
  <meta charset="UTF-8">
  <title>Kanji Workbook</title>
  <script type="text/javascript" src="workbook.js"></script>
  <link rel="stylesheet" type="text/css" href="workbook.css">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
</head>

<!-- body -->
<body onload="init();">

  <!-- header area -->
  <div id="header_area">

    <!-- header message -->
    <span id="header_message"></span>
      
    <!-- header options-->
    <form id="header_options">
      <input type="submit" id="gradebook_link" value="Gradebook" formaction="gradebook.php" formmethod="get">
      <span id="gradebook_divider">|</span>
      <input type="submit" id="scores_link" value="Scores" formaction="scores.php" formmethod="get">
      <span id="scores_divider">|</span>
      <input type="submit" value="Sign Out" formaction="logoutAction.php" formmethod="get">
    </form>

  </div>

  <!-- quiz header area -->
  <div id="quiz_header_area" hidden>
    <span id="quiz_header_title"></span>
    | Progress: 
    <span id="quiz_header_progress"></span>
  </div>

  <!-- options area -->
  <div id="optionsarea">

    <!-- chapter selection  -->
    <select id="chapterselect" class="elementlook">
      <option value="XX">--- Select chapter ---</option>
      <option value="00">Chapter 00</option>
      <option value="03">Chapter 03</option>
      <option value="04">Chapter 04</option>
      <option value="05">Chapter 05</option>
      <option value="06">Chapter 06</option>
      <option value="07">Chapter 07</option>
      <option value="08">Chapter 08</option>
      <option value="09">Chapter 09</option>
      <option value="10">Chapter 10</option>
      <option value="11">Chapter 11</option>
      <option value="12">Chapter 12</option>
    </select>

    <!-- go button -->
    <input type="submit" id="goButton" class="elementlook" value="Go" onclick="goButton(canvas, context);">

    <!-- interaction mode inputs -->
    <input type="radio" id="practiceInput" name="interactionMode" value="practice" checked>
    <label for="practiceInput">Practice</label>

    <input type="radio" id="quizInput" name="interactionMode" value="quiz">
    <label for="quizInput">Quiz</label>

  </div>

  <!-- scores area -->
  <div id="scoresarea" hidden>

    <form>
      <div id="scores_state_area" hidden>
        <!-- scores state area -->
        <textarea id="scores_state_input" name="scores_state_input" cols="50" rows="10"></textarea>
        <br><br>
      </div>

      <!-- continue button -->
      <input type="submit" id="continue_button" class="elementlook" value="Continue" 
        formaction="scoresSubmit.php" formmethod="POST"
      >
    </form>

    <div>
      <a href="#" onclick="displayScore('chapter');">Overall Score</a> |
      <a href="#" onclick="displayScore('individual');">Individual Scores</a> |
      <a href="#" onclick="displayScore('metric');">Metric Scores</a> |
      <a href="#" onclick="displayScore('detailed');">Detailed Scores</a>
    </div>

    <!-- assessment title area -->
    <div id="assessmenttitlearea"></div> 

    <!-- assessment overall score area -->
    <div id="assessmentoverallscorearea"></div>

    <!-- assessment individual scores area -->
    <div id="assessmentindividualscoresarea" hidden></div>

    <!-- assessment metric scores area -->
    <div id="assessmentmetricscoresarea" hidden></div>

    <!-- assessment full scores area -->
    <div id="assessmentdetailedscoresarea" hidden></div>

  </div>

  <!-- workbook and output area -->
  <div id="workbookarea" class="content" style="display: none;">

    <!-- workbook area -->
    <div id="writingarea">

      <!-- transition buttons -->
      <div id="transitionbuttons">
        <input type="submit" id="backButton" class="elementlook" value="Back" onclick="backButton(canvas, context);">
        <input type="submit" id="nextButton" class="elementlook" value="Next" onclick="nextButton(canvas, context);">
      </div>

      <!-- writing canvas -->
      <canvas id="canvas" class="canvaslook">
        <!-- -->
      </canvas>

      <!-- legend area-->
      <div id="legend_area" hidden></div>

      <!-- editing buttons -->
      <div id="editingbuttons">
        <input type="submit" id="clearButton" class="elementlook" value="Clear" onclick="clearButton(canvas, context);">
        <input type="submit" id="undoButton" class="elementlook" value="Undo" onclick="undoButton(canvas, context);">
        <input type="submit" id="assessButton" class="elementlook" value="Assess" onclick="assessButton(canvas, context);">
      </div>

      <!-- demonstration buttons -->
      <div>
        <input type="submit" id="demoButton" class="elementlook" value="Demo" onclick="demoButton(canvas, context);">
        <input type="submit" id="stepsButton" class="elementlook" value="Steps" onclick="stepsButton(canvas, context);">
      </div>

    </div>

    <!-- output area -->
    <div id="feedbackarea">

      <!-- feedback button -->
      <input type="submit" id="feedbackButton" class="elementlook" value="Details" onclick="feedbackButton();" disabled>

      <!-- feedback space -->
      <div id="outputarea"></div>

      <!-- waiting messsage area -->
      <div id="waiting_message_area" hidden>
        <br><br><br>
        <div id="waiting_message_graphic">
          <img src="assets/icon_waiting.png">
        </div>
        <br>
        <div>
          <span id="waiting_message_text" class="largetext">Awaiting User to<br> Click Assess</span>
        </div>
      </div>

    </div>

  </div>

  <?php include "footer.php" ?>

</body>
</html>