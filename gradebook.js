function init() {
  // set background
  document.body.style.backgroundImage = Backgrounds.quizImage;
  document.body.style.backgroundColor = Backgrounds.quizColor;

  // check login
  checkLogin();

  // get the gradebook entries
  entries = getEntries();

  // output gradebook
  outputGradebook(entries);
}

function outputGradebook(entries) {
  // create output
  var output = "";

  // set table tag contants
  var table  = "<table>";
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

  // set table headers
  var firstEntry = entries[0];
  // var usernameClick = "<a href='#' onclick='displaySorted(\"username\");'>username</a>";
  // var usertypeClick = "<a href='#' onclick='displaySorted(\"usertype\");'>usertype</a>";
  var usernameClick = "username";
  var usertypeClick = "usertype";
  output += tr;
  output += th + usernameClick + th_;
  for (var i = 0; i < firstEntry.scores.length; ++i) {
    output += th + firstEntry.scores[i][0] + th_;
  }
  output += tr_;

  // set table data
  for (var i = 0; i < entries.length; ++i) {
    var entry = entries[i];

    // skip non-student entries
    if (entry.usertype !== "student") { continue; }

    output += tr;
    output += td + entry.username + td_;
    for (var j = 0; j < entry.scores.length; ++j) {
      var score = entry.scores[j];
      var scoreValue = score[1];
      var scoreOutput = scoreValue === null ? "-" : scoreValue;
      output += td + scoreOutput + td_;
    }
    output += tr_;
  }

  // end table
  output += table;

  // output gradebook
  var gradebookDisplayArea = document.getElementById("gradebook_display_area");
  gradebookDisplayArea.innerHTML = output;
}

function displaySorted(target) {
  // copy entries
  var es = JSON.parse(JSON.stringify(entries));

  if (target === "username") {
    es.sort(function(a, b) {
      if (a.username < b.username) { return -1; }
      if (a.username > b.username) { return  1; }
      return 0;
    });
  }
  else if (target === "usertype") {
    es.sort(function(a, b) {
      if (a.usertype < b.usertype) { return -1; }
      if (a.usertype > b.usertype) { return  1; }
      return 0;
    });
  }

  outputGradebook(es);
}

function getEntries(gradebook) {

  // get gradebook object
  var gradebookInput = document.getElementById("gradebook_input");
  var gradebookJson = gradebookInput.innerHTML;
  var gradebook = JSON.parse(gradebookJson);

  // iterate through the gradebook
  var entries = [];
  for (var i = 0; i < gradebook.length; ++i) {
    // get the gradebook entry
    var row = gradebook[i];

    // get the username and usertype
    var username = row.username;
    var usertype = row.usertype;

    // get the entry's scores
    var scores = [];
    for (var key in row) {
      // skip indirect keys, username, and usertype
      if (!row.hasOwnProperty(key) || key === "username" || key === "usertype") { continue; }
      
      // add the score to the collection
      var value = row[key];
      var score = [key, value];
      scores.push(score);
    }

    // sort the scores by its key (i.e., assignment type)
    scores.sort(function(a, b) {
      if (a[0] < b[0]) { return -1; }
      if (a[0] > b[0]) { return  1; }
      return 0;
    });

    // create row object and add to array of rows
    var entry = {
      username: username,
      usertype: usertype,
      scores: scores
    };
    entries.push(entry);

  }

  return entries;
}

function outputGradebook2(gradebook) {

  // create output
  var output = "";

  // set table tag contants
  var table  = "<table>";
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

  

}

function checkLogin() {
  // set redirect pages
  var loginPage = "index.php";
  var workbookPage = "workbook.php";

  // get cookie and its tokens
  var cookie = document.cookie;
  var tokens = cookie.split(/[\s;=]+/);

  // get index of "username" and "usertype" 
  var usernameIndex = tokens.findIndex(function(element) { return element === "username"; });
  var usertypeIndex = tokens.findIndex(function(element) { return element === "usertype"; });

  // case: "username" not found => clear cookie record and redirect to login page
  if (usernameIndex < 0) { window.location.href = loginPage; }
  
  // get username and usertype
  var username_text = tokens[usernameIndex + 1];
  var usertype_text = tokens[usertypeIndex + 1];

  // case: "username" is empty => clear cookie record and redirect to login page
  if (username_text === "") { window.location.href = loginPage; }

  // case: "usertype" is student or tester => redirect to workbook page
  if (usertype_text === "student" || usertype_text === "tester") { window.location.href = workbookPage; }

  // set header message
  var headerMessage = document.getElementById("header_message");
  headerMessage.innerHTML = "こんにちは, <strong>" + username_text + "</strong>";
}

function returnButton() {
  window.location = "workbook.php";
}

// #region Fields

// The gradebook entries.
var entries;

// The background images.
var Backgrounds = {
  practiceImage: "url(assets/bg_lighttan.jpg)",
  practiceColor: "#F6F0E8",
  quizImage: "url(assets/bg_lightgrey.jpg)",
  quizColor: "#E5E5E5"
};

// #endregion