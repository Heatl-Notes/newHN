/**
 * HERE WE HAVE THE FUNCTIONS THAT WILL BE USED IN THE LOGIN AND SIGNUP FORMS
 */

/*
LOGIN
*/

function login() {
  const emailForm = document.getElementById("login-email").value;
  const passwordForm = document.getElementById("login-password").value;
  sendLogin({
    email: emailForm,
    passwordForm: passwordForm,
  });

  async function sendLogin(user) {
    let url = ""; //end point

    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json;charset=utf-8",
        },
      });

      let json = await response.json();

      if (response.status == 200) {
        localStorage.setItem("token", json.token);
        localStorage.setItem("userID", json.userID);
        localStorage.setItem("userName", json.userName);
        window.location = "dashboard.html";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("userID");
        localStorage.removeItem("userName");
        alert(json.message);
      }
    } catch (e) {
      window.location = "dashboard.html"; //just for testing!
      console.log(e);
    }
  }
}
// triggers login function DO NOT DELETE!
document.getElementById("commit").addEventListener("click", login, false);

/*  SIGNUP
/**
 * @param {Object} user - user object to be created in the database (firstName, lastName, email, password)
 */
function createUser() {
  if (
    document.getElementById("signup-password").value !=
    document.getElementById("signup-password-confirmation").value
  )
    alert("The passwords do not match!");
  else
    create({
      firstName: document.getElementById("signup-name").value,
      lastName: document.getElementById("signup-lastname").value,
      email: document.getElementById("email").value,
      password: document.getElementById("signup-password").value,
    });
}
async function create(user) {
  let url = ""; //end point

  try {
    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    let data = await response.json();

    if (response.status == 201) {
      alert("Usuário criado com sucesso.");
      window.location = "index.html";
    } else {
      alert(data.message);
    }
  } catch (e) {
    console.log(e);
  }
}

document
  .getElementById("createUserButton")
  .addEventListener("click", createUser, false);

/**
 * TOGGLE BETWEEN LOGIN AND SIGNUP FORMS
 */
function showLogin() {
  let loginButton = document.getElementById("login-icon");
  loginButton.className = "";
  loginButton.classList.add("active");

  let signupButton = document.getElementById("signup-icon");
  signupButton.className = "";
  signupButton.classList.add("inactive");
  signupButton.classList.add("underlineHover");

  //toggle forms
  document.getElementById("login-form").style.display = "block";
  document.getElementById("signup-form").style.display = "none";
}

function showSignup() {
  let signupButton = document.getElementById("signup-icon");
  signupButton.className = "";
  signupButton.classList.add("active");

  let loginButton = document.getElementById("login-icon");
  loginButton.className = "";
  loginButton.classList.add("inactive"); // underlineHover
  loginButton.classList.add("underlineHover");

  //toggle forms
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}
