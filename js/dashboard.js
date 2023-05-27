const globalCourrentClient = loadCurrentClient();
console.log(globalCourrentClient);

async function loadCurrentClient(user) {
  let userId = 12345678919; //capturando o ID do usuario logado
  let client = await fetch(`http://localhost:3000/clients?id=${userId}`); //fetch patients from api
  let clientJson = await client.json();

  return clientJson;
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
  closeAgenda();
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
    innerH = `<h4>Paciente:  ${patient.name} </h4> <br><span>Idade: ${patient.age} </span> <button id="delete-buttom-patient-card"onclick="deletePatientOnClick(event,${cpf})">EXCLUIR</button>`;
    var novoElemento = document.createElement("div");
    novoElemento.className = "patient-card";
    novoElemento.innerHTML = innerH;

    novoElemento.addEventListener("click", () => {
      showPatientProfile(patient);
    });

    main.appendChild(novoElemento);
  });
}

/**
 *
 */

async function openProfile() {
  closeAgenda();
  closeButton.addEventListener("click", () => {
    popupElemento.remove();
  });

  let localCourrentClient = await globalCourrentClient;
  var novoElemento = document.createElement("div");
  novoElemento.className = "profile-card";
  novoElemento.innerHTML = `<h1>Cuidador</h1><br/><h2>Nome: ${localCourrentClient?.name} </h2><h2>Experiência: ${localCourrentClient.monthsExperience} </h2><h2>CPF:  ${localCourrentClient.cpf}</h2><h2>Telefone: ${localCourrentClient.phone} </h2><h2>Email:  ${localCourrentClient.email}</h2>`;

  var main = document.querySelector(".main-content");
  main.innerHTML = "";
  main.appendChild(novoElemento);
}
function closeAgenda() {
  let agendaDiv = document.querySelector(".popup-agenda");
  agendaDiv.style.display = "none";
}

async function loadEvents() {
  let localCourrentClient = await globalCourrentClient;
  let events = localCourrentClient?.calendar;
  console.log("EVENTS OF A CLIENT: ", events);

  let eventsDiv = document.querySelector(".events-agenda");
  console.log("Captured event div", eventsDiv);
  eventsDiv.innerHTML = "";

  for (let date in events) {
    let eventsOnDate = events[date];
    console.log("Events on date", eventsOnDate);
    let eventsOnDateDiv = document.createElement("div");
    eventsOnDateDiv.className = "events-on-date";

    let dateDiv = document.createElement("div");
    dateDiv.className = "date";
    dateDiv.innerHTML = date;

    eventsOnDateDiv.appendChild(dateDiv);

    for (let event of eventsOnDate) {
      let eventDiv = document.createElement("div");
      eventDiv.className = "event";
      eventDiv.innerHTML = `<span class="hour">${event.hour}</span><span class="observation">${event.observation}</span><span class="category">${event.category}</span>`;

      eventsOnDateDiv.appendChild(eventDiv);
    }

    eventsDiv.appendChild(eventsOnDateDiv);
  }
}

async function openAgenda() {
  let agendaDivName = document.querySelector("#agendaName");
  let localCourrentClient = await globalCourrentClient;
  agendaDivName.innerHTML = `Agenda de ${localCourrentClient?.name}`;

  let agendaDiv = document.querySelector(".popup-agenda");
  agendaDiv.style.display = "block";

  let closeAgendaButton = document.querySelector("#close-agenda-button");
  closeAgendaButton?.addEventListener("click", () => {
    if (agendaDiv) {
      closeAgenda();
    }
  });

  loadEvents(); //here I load the events of a client

  //capturing the event elements
  let dateElement = document.querySelector("#date");
  let descriptionElement = document.querySelector("#description");
  let timeElement = document.querySelector("#time");

  //capturing the current client
  let currentClient = await globalCourrentClient;

  let date = "";
  let description = "";
  let time = "";

  dateElement?.addEventListener("input", () => {
    date = dateElement?.value;
  });
  descriptionElement?.addEventListener("input", () => {
    description = descriptionElement?.value;
  });

  timeElement?.addEventListener("input", () => {
    time = timeElement?.value;
  });

  let typeOfEvent = document.querySelector("#typeOfEvent").value;

  let addEventButton = document.querySelector("#addEventButton");
  addEventButton?.addEventListener("click", () => {
    let eventObj = {
      hour: time,
      observation: description,
      category: typeOfEvent,
    };

    try {
      addEvent(currentClient, date, eventObj);
    } catch (error) {
      console.log(error);
    }

    // if (currentClient.calendar[date]) {
    //   console.log(currentClient.calendar[date]);
    //   currentClient.calendar[date].push(eventObj);
    // } else {
    //   currentClient.calendar[date] = [eventObj];
    // }
  });
}
function eventParamsCheck(date, event) {
  return (
    date === "" ||
    event.hour === "" ||
    event.observation === "" ||
    event.category === ""
  );
}

async function addEvent(client, date, event) {
  if (eventParamsCheck(date, event)) {
    alert("Parametros invalidos! Data e/ou horario vazio(s)");
    return;
  }

  let cpf = client.cpf;
  let response = await fetch(`http://localhost:3000/clients?id=${cpf}`);
  const clientJson = await response.json();

  let clientCalendar = clientJson?.calendar; // obtenho o calendário do cliente

  if (date in clientCalendar) {
    console.log("date already exists in calendar");
    // A data já existe no calendário, adiciona o evento à lista de eventos dessa data
    clientCalendar[date].push(event);
  } else {
    // A data não existe no calendário, cria a chave e adiciona o evento
    clientCalendar[date] = [event];
  }

  // Atualiza o calendário do cliente no servidor
  fetch(`http://localhost:3000/clients/${cpf}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      calendar: clientCalendar,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Evento adicionado com sucesso!"); //to the user
      console.log("Calendário atualizado:", data); //to the developer
    })
    .catch((error) => {
      alert("Erro ao atualizar o calendário!"); //to the user
      console.error("Erro ao atualizar o calendário:", error); //to developer
    });
}

//OPEN PATIENT PROFILE
function showPatientProfile(patient) {
  const cpf = patient?.cpf;
  const name = patient?.name;
  const age = patient?.age;

  const popupElemento = document.createElement("div");
  popupElemento.className = "popup";
  popupElemento.innerHTML = `
    <span class="closeButton">X</span>
    <h1 class="name-patient-profile">Sr(a) ${name}</h1>
    <div class=patient-info>
      <h3>CPF: ${cpf}</h3>
      <h3>Nome: ${name} COMPLETO?</h3>
      <h3>Idade: ${age}</h3>
      <h3>Outros detalhes do paciente...</h3>
    </div>
  `;
  popupElemento.style.display = "block";
  document.body.appendChild(popupElemento);
  const closeButton = popupElemento.querySelector(".closeButton");
  closeButton.addEventListener("click", () => {
    popupElemento.remove();
  });
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
function deletePatientOnClick(event, cpf) {
  event.stopPropagation();
  deletePatient(cpf);
}

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
