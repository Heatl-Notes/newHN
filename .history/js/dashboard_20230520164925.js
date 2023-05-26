const globalCourrentClient = loadCurrentClient();

async function loadCurrentClient(user) {
  let userId = 12345678919; //capturando o ID do usuario logado
  let clients = await fetch("http://localhost:3000/clients"); //fetch patients from api
  let clientsJson = await clients.json();
  let courrentClient = null;
  clientsJson.forEach((client) => {
    if (client?.cpf == userId) {
      courrentClient = client;
    }
  });

  return courrentClient;
}
/**
 * This file is responsible for the dashboard page
 */

//loadPatients function is called when the page is loaded to show the patients
loadPatients();

const buttons = document.querySelectorAll(".nav-btn");

// Add event listener to each button
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove "active" class from all buttons
    buttons.forEach((button) => {
      button.classList.remove("active");
    });
    // Add "active" class to clicked button
    button.classList.add("active");
  });
});

async function loadPatients() {
  var main = document.querySelector(".main-content");
  main.innerHTML = "";

  //to up the server
  //run the command:json-server --watch db.json (in this directory)

  //REAL CODE
  let patients = await fetch("http://localhost:3000/patients"); //fetch patients from api
  let patientsJson = await patients.json();
  let innerH = "";
  let cpf = 0;
  patientsJson.forEach((patient) => {
    cpf = patient?.cpf;
    innerH = `<h4>Paciente:  ${patient.name} </h4> <br><span>Idade: ${patient.age} </span> <button onclick="deletePatient(${cpf})">excluir</button>`;
    var novoElemento = document.createElement("div");
    novoElemento.className = "patient-card";
    novoElemento.innerHTML = innerH;

    main.appendChild(novoElemento);
  });
}

/**
 *
 */

async function openProfile() {
  let localCourrentClient = await globalCourrentClient;
  console.log(localCourrentClient);
  var novoElemento = document.createElement("div");
  novoElemento.className = "profile-card";
  novoElemento.innerHTML = `<h1>Cuidador</h1><br/><h2>Nome: ${localCourrentClient?.name} </h2><h2>Experiência: ${localCourrentClient.monthsExperience} </h2><h2>CPF:  ${courrentClient.cpf}</h2><h2>Telefone: ${courrentClient.phone} </h2><h2>Email:  ${courrentClient.email}</h2>`;

  var main = document.querySelector(".main-content");
  main.innerHTML = "";
  main.appendChild(novoElemento);
}

async function openAgenda() {
  let localCourrentClient = await globalCourrentClient;
  console.log(await localCourrentClient);

  var novoElemento = document.createElement("div");
  novoElemento.className = "profile-card";
  novoElemento.innerHTML =
    "<h1>Cuidador</h1><br/><h2>Nome: RONALDO CUIDADOR</h2><h2>Experiência: ESTAGIÁRIO</h2><h2>CPF: </h2><h2>Telefone: </h2><h2>Email: </h2><h2>Endereço: </h2><h2>CEP: </h2>";
  var main = document.querySelector(".main-content");
  main.innerHTML = "";
  main.appendChild(novoElemento);
}

//ADD PATIENTS

const addPatientButton = document.getElementById("addPatientButton");
const addPatientPopup = document.getElementById("addPatientPopup");
const closeButton = document.querySelector(".closeButton");
closeButton.addEventListener("click", () => {
  addPatientPopup.style.display = "none";
});
const confirmButton = document.getElementById("confirmButton");

addPatientButton.addEventListener("click", () => {
  addPatientPopup.style.display = "block";
});

/**
 * Event listener para o botão de confirmação do popup de adicionar paciente
 * Captura os dados no popup e adiciona o paciente caso ele nao exista
 * Apos enviar os dados para o metodo addPatient, o popup é fechado
 */
confirmButton.addEventListener("click", () => {
  const cpf = document.getElementById("cpf").value;
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;

  addPatient(cpf, name, age);

  addPatientPopup.style.display = "none";
});

async function addPatient(cpf, name, age) {
  const newPatient = {
    cpf: cpf,
    name: name,
    age: age,
  };

  try {
    const alreadyRegistered = await fetch(
      "http://localhost:3000/patients?cpf=${cpf}"
    );
    const patientsJson = await alreadyRegistered.json();

    if (patientsJson.length > 0) {
      alert("Um paciente com o mesmo CPF já está cadastrado!");
      return; // Retorna sem adicionar o paciente
    }
    const response = await fetch("http://localhost:3000/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPatient),
    });

    if (response.ok) {
      // Se o paciente foi adicionado com sucesso
      console.log("Paciente adicionado com sucesso!");
    } else {
      // Se ocorreu algum erro ao adicionar o paciente
      console.log("Erro ao adicionar paciente");
    }
  } catch (error) {
    console.log("Erro ao adicionar paciente:", error);
  }
}

//DELETE PATIENTS
async function deletePatient(cpfToDelete) {
  try {
    // Verificar se o paciente existe antes de excluir
    const response = await fetch(
      `http://localhost:3000/patients?cpf=${cpfToDelete}`
    );
    const patientsJson = await response.json();
    console.log("Paciente encontrado:", patientsJson);

    if (patientsJson.length === 0) {
      console.log("Paciente não encontrado!");
      return; // Retorna sem excluir o paciente
    }

    // Excluir o paciente caso seja encontrado
    const patientId = patientsJson[0].id; // Supondo que a API retorna um campo "id" para cada paciente
    const deleteResponse = await fetch(
      `http://localhost:3000/patients/${patientId}`,
      {
        method: "DELETE",
      }
    );

    if (deleteResponse.ok) {
      loadPatients(); // Recarrega a lista de pacientes após a exclusão
      console.log("Paciente excluído com sucesso!");
    } else {
      console.log("Erro ao excluir paciente");
    }
  } catch (error) {
    console.log("Erro ao excluir paciente:", error);
  }
}

/**
 * funtion to logout
 */
function logout() {
  window.location.href = "index.html";
}
