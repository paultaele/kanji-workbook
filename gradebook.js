function init() {
  // set background
  document.body.style.backgroundImage = Backgrounds.quizImage;
  document.body.style.backgroundColor = Backgrounds.quizColor;

  // check login
  checkLogin();

  // get the gradebook entries
  entries = getEntries();

  // sort entries by last name
  entries = sortEntries(entries, "lastname");

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
  var tdName = "<td style='text-align: left'>";
  var td_    = "</td>";
  var br     = "<br>";

  // start table
  output += table;

  // set table headers
  var firstEntry = entries[0];
  // var usernameClick = "<a href='#' onclick='displaySorted(\"username\");'>username</a>";
  // var usertypeClick = "<a href='#' onclick='displaySorted(\"usertype\");'>usertype</a>";
  // var lastnameClick = "lastname";
  // var firstnameClick = "firstname";
  // var usernameClick = "username";
  var lastnameClick = "<a href='#' onclick='displaySorted(\"lastname\");'>lastname</a>";
  var firstnameClick = "<a href='#' onclick='displaySorted(\"firstname\");'>firstname</a>";
  var courseClick = "<a href='#' onclick='displaySorted(\"course\");'>course</a>";
  var semesterClick = "<a href='#' onclick='displaySorted(\"semester\");'>semester</a>";
  
  // start table row
  output += tr;

  // display headers
  output += th + lastnameClick + th_;
  output += th + firstnameClick + th_;
  output += th + courseClick + th_;
  output += th + semesterClick + th_;

  // display headers for scores
  for (var i = 0; i < firstEntry.scores.length; ++i) {
    output += th + "<span style='font-size: .75em'>" + firstEntry.scores[i][0] + "</span>" + th_;
  }

  // end table row
  output += tr_;

  // set table data
  for (var i = 0; i < entries.length; ++i) {
    // get the current entry
    var entry = entries[i];

    // skip non-student entries
    if (entry.usertype !== "student") { continue; }

    // start table row
    output += tr;

    // display contents
    output += tdName + entry.lastname + td_;
    output += tdName + entry.firstname + td_;
    output += tdName + entry.course + td_;
    output += tdName + entry.semester + td_;
    // output += td + entry.username + td_;

    // display scores
    for (var j = 0; j < entry.scores.length; ++j) {
      var score = entry.scores[j];
      var scoreValue = score[1];
      var scoreOutput = scoreValue === null ? "-" : scoreValue;
      output += td + scoreOutput + td_;
    }

    // end table row
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

  // sort entries
  es = sortEntries(es, target);

  outputGradebook(es);
}

function sortEntries(es, target) {
  // sort entries
  es.sort(function(a, b) {
    // get values
    var first = a[target];
    var second = b[target]; 

    // handle null cases
    if (first === null) { return -1; }
    if (second === null) { return 1; }

    // make values into lowercase
    first = first.toLowerCase();
    second = second.toLowerCase();

    // local sort
    if (first < second) { return -1; }
    if (first > second) { return  1; }
    return 0;
  });

  return es;
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

    // get the non-scores
    var username = row.username;
    var usertype = row.usertype;
    var firstname = row.firstname;
    var lastname = row.lastname;
    var course = row.course;
    var semester = row.semester;

    // skip non-Spring 2019 semester students
    if (semester !== "2019A") { continue; }

    // get the entry's scores
    var scores = [];
    for (var key in row) {

      // skip indirect keys and non-score keys
      if (!row.hasOwnProperty(key) || key === "username" || key === "usertype" || key === "firstname" || key === "lastname" || key === "course" || key === "semester") { continue; }
      
      // add the score to the collection
      var value = row[key];
      var score = [key, value];
      scores.push(score);
    }

    // sort the scores by its key (i.e., assignment set type)
    scores.sort(function(a, b) {
      if (a[0] < b[0]) { return -1; }
      if (a[0] > b[0]) { return  1; }
      return 0;
    });

    // create row object and add to array of rows
    var entry = {
      username: username,
      usertype: usertype,
      firstname: firstname,
      lastname: lastname,
      course: course,
      semester: semester,
      scores: scores
    };
    entries.push(entry);

    // initially sort by last name
    entries.sort(function(a, b) {
      if (a.lastname < b.lastname) { return -1; }
      if (a.lastname > b.lastname) { return  1; }
      return 0;
    });
  }

  return entries;
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
  var firstnameIndex = tokens.findIndex(function(element) { return element === "firstname"; });

  // case: "username" not found => clear cookie record and redirect to login page
  if (usernameIndex < 0) { window.location.href = loginPage; }
  
  // get username and usertype
  var username_text = tokens[usernameIndex + 1];
  var usertype_text = tokens[usertypeIndex + 1];
  var firstname_text = tokens[firstnameIndex + 1];

  // case: "username" is empty => clear cookie record and redirect to login page
  if (username_text === "") { window.location.href = loginPage; }

  // case: "usertype" is student or tester => redirect to workbook page
  if (usertype_text === "student" || usertype_text === "tester") { window.location.href = workbookPage; }

  // set header message
  var headerMessage = document.getElementById("header_message");
  headerMessage.innerHTML = "こんにちは, <strong>" + firstname_text + "-さん</strong>"; 
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