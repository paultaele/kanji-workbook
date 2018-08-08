function init() {
  // set background
  document.body.style.backgroundImage = Backgrounds.quizImage;
  document.body.style.backgroundColor = Backgrounds.quizColor;

  // check login
  checkLogin();

  // get gradebook object
  var gradebookInput = document.getElementById("gradebook_input");
  var gradebookJson = gradebookInput.innerHTML;
  var gradebook = JSON.parse(gradebookJson);

  // output gradebook
  outputGradebook(gradebook);
}

function outputGradebook(gradebook) {

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

  // iterate through the gradebook
  for (var i = 0; i < gradebook.length; ++i) {
    // get the gradebook entry
    var entry = gradebook[i];

    // get the username and usertype
    var username = entry.username;
    var usertype = entry.usertype;

    // get the entry's scores
    var scores = [];
    for (var key in entry) {
      // skip indirect keys, username, and usertype
      if (!entry.hasOwnProperty(key) || key === "username" || key === "usertype") { continue; }
      
      // add the score to the collection
      var value = entry[key];
      var score = [key, value];
      scores.push(score);
    }

    // sort the scores by its key (i.e., assignment type)
    scores.sort(function(a, b) {
      if (a[0] < b[0]) { return -1; }
      if (a[0] > b[0]) { return  1; }
      return 0;
    });

    // create table header
    if (i === 0) {
      output += tr;

      output += th + "Username" + th_;
      output += th + "Usertype" + th_;
      
      for (var j = 0; j < scores.length; ++j) {
        output += th + scores[j][0] + th_;
      }

      output += tr_;
    }

    // create table data
    output += tr;

    output += td + username + td_;
    output += td + usertype + td_;
    
    for (var j = 0; j < scores.length; ++j) {
      var score = scores[j];
      var scoreValue = score[1];

      if (scoreValue === null) { scoreValue = "N/A"; }

      output += td + scoreValue + td_;
    }

    output += tr_;
  }

  // end table
  output += table_;

  // output gradebook
  var gradebookDisplayArea = document.getElementById("gradebook_display_area");
  gradebookDisplayArea.innerHTML = output;

}

function checkLogin() {
  // set redirect pages
  var loginPage = "index.html";
  var workbookPage = "workbook.html";

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

  // case: "usertype" is student => redirect to workbook page
  if (usertype_text === "student") { window.location.href = workbookPage; }

  // set header message
  var headerMessage = document.getElementById("header_message");
  headerMessage.innerHTML = "こんにちは, <strong>" + username_text + "</strong>";
}

function returnButton() {
  window.location = "workbook.html";
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