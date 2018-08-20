function init() {

  // set background
  document.body.style.backgroundImage = Backgrounds.quizImage;
  document.body.style.backgroundColor = Backgrounds.quizColor;

  // check login
  checkLogin();

  // get scores state object
  var scoresStateInput = document.getElementById("scores_state_input");
  var scoresStateJson = scoresStateInput.innerHTML;
  var scoresState = JSON.parse(scoresStateJson);

  // output scores state
  outputScoresState(scoresState);
}

function checkLogin() {
// set redirect pages
  var loginPage = "index.php";
  var workbookPage = "workbook.php";

  // get cookie
  var cookie = document.cookie;

  // tokenize the cookie
  var tokens = cookie.split(/[\s;=]+/);

  // get index of "username"
  var usernameIndex = tokens.findIndex(function(element) { return element === "username"; });
  var usertypeIndex = tokens.findIndex(function(element) { return element === "usertype"; });

  // case: "username" not found => clear cookie record and redirect to login page
  if (usernameIndex < 0) {
    window.location.href = loginPage;
  }
  
  // get username and usertype
  var username_text = tokens[usernameIndex + 1];
  var usertype_text = tokens[usertypeIndex + 1];

  // case: "username" is empty => clear cookie record and redirect to login page
  if (username_text === "") { window.location.href = loginPage; }
  
  // case: "usertype" is guest => redirect to workbook page
  if (usertype_text === "guest") { window.location.href = workbookPage; }

  // set header message
  var headerMessage = document.getElementById("header_message");
  headerMessage.innerHTML = "こんにちは, <strong>" + username_text + "</strong>";

  // set gradebook link display flag
  var displayState;
  if (usertype_text === "student" || usertype_text === "tester") { displayState = "none"; }
  else if (usertype_text === "instructor") { displayState = "inline"; }
  document.getElementById("gradebook_link").style.display = displayState;
  document.getElementById("gradebook_divider").style.display = displayState;
}

function returnButton() {
  window.location = "workbook.php";
}

function getTextStars(count, max) {
  //
  count = Math.round(count);

  //
  var text = "";
  for (var i = 0; i < count; ++i) { text += "★"; }
  for (var i = 0; i < max - count; ++i) { text += "☆" }

  return text;
}

function outputScoresState(scoresState) {

  // extract the set scores
  var setScores = [];
  for (var p in scoresState) {
    if (p.substring(0, 3) !== "set") { continue; }
    setScores.push( [p, scoresState[p]] );
  }

  // sort set scores in ascending order
  setScores.sort(function(a, b){
    return a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0);
  });

  // create output
  var output = "";

  // set table tag contants
  var table  = "<table class='centered smalltable table2col_25_75 largetext'>";
  var table_ = "</table>";
  var tr     = "<tr>";
  var tr_    = "</tr>";
  var th     = "<th>";
  var th_    = "</th>"; 
  var td     = "<td>";
  var td_    = "</td>";
  var br     = "<br>";

  // start table
  output += table;

  // set table rows
  output += tr;
  output += th + "Set" + th_;
  output += th + "Top Score" + th_;
  output += tr_;

  // set table data
  for (var i = 0; i < setScores.length; ++i) {
    var setScore = setScores[i];
    var setTd = "Set " + setScore[0].substring(3, 5);
    var scoreTd = (setScore[1] === null) ? "<em>no record</em>" : getTextStars(setScore[1], 10);

    output += tr;
    output += td + setTd + td_;
    output += td + scoreTd + td_;
    output += tr_;
  }

  // end table
  output += table_;

  // output scores
  var scoresDisplayArea = document.getElementById("scores_display_area");
  scoresDisplayArea.innerHTML = output;
}

// #region Fields.

// The background images.
var Backgrounds = {
  practiceImage: "url(assets/bg_lighttan.jpg)",
  practiceColor: "#F6F0E8",
  quizImage: "url(assets/bg_lightgrey.jpg)",
  quizColor: "#E5E5E5"
};

// #endregion