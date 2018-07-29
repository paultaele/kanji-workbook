function init() {
  // check login
  checkLogin();

  // get scores state object
  var scoresStateInput = document.getElementById("scores_state_input");
  var scoresStateJson = scoresStateInput.innerHTML;
  var scoresState = JSON.parse(scoresStateJson);
  
  // create output
  var output = "";
  output += "ch00: " + scoresState["ch00"] + "<br>";
  output += "ch03: " + scoresState["ch03"] + "<br>";
  output += "ch04: " + scoresState["ch04"] + "<br>";
  output += "ch05: " + scoresState["ch05"] + "<br>";

  // output scores
  var scoresDisplayArea = document.getElementById("scores_display_area");
  scoresDisplayArea.innerHTML = output;
}

function checkLogin() {

  var loginPage = "index.html";

  // get cookie
  var cookie = document.cookie;

  // tokenize the cookie
  var tokens = cookie.split(/[\s;=]+/);

  // get index of "username"
  var found = tokens.findIndex(function(element) {
    return element === "username";
  });

  // case: "username" not found => go back to login page
  if (found < 0) { window.location.href = loginPage; }
  
  // get username
  var username_text = tokens[found + 1];

  // case: "username" is empty => go back to login page
  if (username_text === "") { window.location.href = loginPage; }

  // set header message
  var headerMessage = document.getElementById("header_message");
  headerMessage.innerHTML = "こんにちは, <strong>" + username_text + "</strong>";
}

function returnButton() {
  window.location = "workbook.html";
}