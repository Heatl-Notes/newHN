/**
 * HERE WE HAVE THE FUNCTIONS THAT WILL BE USED IN THE LOGIN AND SIGNUP FORMS
 */

/*
LOGIN
*/
function showLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.classList.add("show");
}
function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.classList.remove("show");
}

function login() {
  showLoadingIndicator();
  const emailForm = document.getElementById("login-email").value;
  const passwordForm = document.getElementById("login-password").value;

  sendLogin({
    email: emailForm,
    password: passwordForm,
  }).finally(() => {
    setTimeout(() => {
      alert("Senha ou email incorretos!");
      hideLoadingIndicator();
    }, 2000);
  });

  async function sendLogin(user) {
    let url = "http://localhost:3000/login"; //end point
    const email = user.email;
    const password = user.password;

    try {
      fetch(url, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          // Verifica o status da resposta
          if (response.status === 200) {
            setTimeout(() => {
              hideLoadingIndicator();
              window.location = "dashboard.html";
            }, 1000);

            return response.json(); // Converte a resposta em JSON
          } else {
            throw new Error("Erro na autenticação");
          }
        })
        .then((data) => {
          // Lógica para lidar com a resposta do servidor
          localStorage.setItem("token", data.token);
          localStorage.setItem("userID", data.userID);
          localStorage.setItem("userName", data.userName);
        })
        .catch((error) => {
          // Lógica para lidar com erros
        });
    } catch (e) {
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
      email: document.getElementById("signup-email").value,
      cpf: document.getElementById("signup-cpf").value,
      password: document.getElementById("signup-password").value,
      name: document.getElementById("signup-name").value,
      lastName: document.getElementById("signup-lastname").value,
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
