function init() {
  // check login
  checkLogin();

  // debug
  // var testElement = document.getElementById("test_element");
  // console.log(testElement.innerHTML);
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