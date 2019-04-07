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

    <!-- set selection  -->
    <select id="set_select" class="elementlook">
      <!-- <option value="XX">--- Select Set ---</option>
      <option value="00">Set 00</option>
      <option value="03">Set 03</option>
      <option value="04">Set 04</option>
      <option value="05">Set 05</option>
      <option value="06">Set 06</option>
      <option value="07">Set 07</option>
      <option value="08">Set 08</option>
      <option value="09">Set 09</option>
      <option value="10">Set 10</option>
      <option value="11">Set 11</option>
      <option value="12">Set 12</option> -->
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
      <!-- scores state area -->
      <div id="scores_state_area" hidden>
        <textarea id="scores_state_input" name="scores_state_input" cols="50" rows="10"></textarea>
        <br><br>
      </div>

      <!-- file name area -->
      <div id="file_name_area" hidden>
        <textarea id="file_name_input" name="file_name_input"></textarea>
        <br><br>
      </div>

      <!-- sketch data area -->
      <div id="sketch_data_area" hidden>
        <textarea id="sketch_data_input" name="sketch_data_input"></textarea>
        <br><br>
      </div>

      <!-- continue button -->
      <input type="submit" id="continue_button" class="elementlook" value="Continue" 
        formaction="scoresSubmit.php" formmethod="POST"
      >
    </form>

    <!-- specialized scores link -->
    <div>
      <a href="#" onclick="displayScore('set');">Overall Score</a> |
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

  <!-- workbook area -->
  <div id="workbookarea" class="content" style="display: none;">

    <!-- writing area -->
    <div id="writingarea">

      <!-- transition buttons: back, next -->
      <div id="transitionbuttons">
        <input type="submit" id="backButton" class="elementlook" value="Back" onclick="backButton(canvas, context);">
        <input type="submit" id="nextButton" class="elementlook" value="Next" onclick="nextButton(canvas, context);">
      </div>

      <!-- writing canvas -->
      <canvas id="canvas" class="canvaslook"></canvas>

      <!-- legend area-->
      <div id="legend_area" hidden></div>

      <!-- editing buttons: clear, undo, assess -->
      <div id="editingbuttons">
        <input type="submit" id="clearButton" class="elementlook" value="Clear" onclick="clearButton(canvas, context);">
        <input type="submit" id="undoButton" class="elementlook" value="Undo" onclick="undoButton(canvas, context);">
        <input type="submit" id="assessButton" class="elementlook" value="Assess" onclick="assessButton(canvas, context);">
      </div>

      <!-- demonstration buttons: demo, steps -->
      <div>
        <input type="submit" id="demoButton" class="elementlook" value="Demo" onclick="demoButton(canvas, context);">
        <input type="submit" id="stepsButton" class="elementlook" value="Steps" onclick="stepsButton(canvas, context);">
      </div>

    </div>

    <!-- feedback area -->
    <div id="feedbackarea">

      <!-- feedback button -->
      <input type="submit" id="feedbackButton" class="elementlook" value="Details" onclick="feedbackButton();" disabled>

      <!-- output area -->
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

      <!-- vocabulary area -->
      <div id="vocabulary_area"></div>

    </div>

  </div>

  <?php include "footer.php" ?>

</body>
</html>