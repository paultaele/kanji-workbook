function init() {
  checkLogin();
}

function checkLogin() {
    
  // set destination page
  var destinationPage = "workbook.html";

  // get cookie
  var cookie = document.cookie;

  // tokenize the cookie
  var tokens = cookie.split(/[\s;=]+/);

  // get index of "username"
  var found = tokens.findIndex(function(element) {
    return element === "username";
  });

  // case: "username" not found => quit
  if (found < 0) { return; }
  
  // get username
  var username_text = tokens[found + 1];

  // case: "username" is empty => quit
  if (username_text === "") { return; }

  // redirect to destination page
  window.location.href = destinationPage;
}