function init() {
  // set background
  document.body.style.backgroundImage = Backgrounds.quizImage;
  document.body.style.backgroundColor = Backgrounds.quizColor;

  // check login
  checkLogin();

  // // get scores state object
  // var scoresStateInput = document.getElementById("scores_state_input");
  // var scoresStateJson = scoresStateInput.innerHTML;
  // var scoresState = JSON.parse(scoresStateJson);

  // outputScoresState(scoresState);
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