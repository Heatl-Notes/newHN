let isEditingAgenda = false;
let showAllEvents = false;

let apiUrl = "https://health-notes-47645d4f2894.herokuapp.com";
// let apiUrl = "http://localhost:8080";

const globalCourrentClient = loadCurrentClient();

async function loadCurrentClient() {
  let userCpf = localStorage.getItem("userCpf"); //capturando o ID do usuario logado

  let response = await fetch(`${apiUrl}/caregiver/${userCpf}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
  });

  let currentCaregiver = await response.json();

  return currentCaregiver;
}

async function loadPatient(cpf) {
  let response = await fetch(`${apiUrl}/patient/${cpf}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
  });

  let patient = await response.json();

  return patient;
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
  let patients = await fetch(`${apiUrl}/patient`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
  });
  //fetch patients from api
  let patientsJson = await patients.json();
  let innerH = "";
  let cpf = 0;
  
  patientsJson.forEach((patient) => {
    cpf = patient?.cpf;

    let dotElementComorbitities = `<span id="dot-label" class="green-dot"></span> (NÃO POSSUI)`;
    let dotElementComplexprocedures = `<span id="dot-label" class="green-dot"></span> (NÃO PRECISA)`;

    let patientComorbidities = patient.comorbidities;
    if (patientComorbidities[0].description !== "") {
      dotElementComorbitities = `<span id="dot" class="red-dot"></span> (POSSUI)`;
    }

    let patientProcedures = patient.complexProcedures;
    if (patientProcedures[0].description !== "") {
      dotElementComplexprocedures = `<span id="dot" class="red-dot"></span> (PRECISA)`;
    }

    innerH = `<h3>Nome:  ${patient.name} </h3> 
      <p id="dot-label  "><strong>Doenças crônicas:</strong> ${dotElementComorbitities} </p><p id="dot-label  "><strong>Procedimentos especializados:</strong> ${dotElementComplexprocedures} </p><span><strong>Idade: ${patient.age} </strong> </span> <button id="delete-buttom-patient-card"onclick="deletePatientOnClick(event,${cpf})">EXCLUIR</button>`;
    var novoElemento = document.createElement("div");
    novoElemento.className = "patient-card";
    novoElemento.innerHTML = innerH;

    novoElemento.addEventListener("click", () => {
      showPatientProfile(patient);
    });

    main.appendChild(novoElemento);
  });
}

function closeAgenda() {
  let agendaDiv = document.querySelector(".popup-agenda");
  agendaDiv.style.display = "none";
}

async function deleteEventOnClick(event, date) {
  event.preventDefault();
  let localCourrentClient = await globalCourrentClient;
  let events = localCourrentClient?.calendar;

  delete events[date];

  event.preventDefault();
  const client = await globalCourrentClient; // Obtenha o ID do cliente da maneira adequada
  const url = `${apiUrl}/clients/${client?.cpf}/calendar/${date}`;
  fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        console.log("Evento deletado com sucesso");
        isEditingAgenda = true;
        loadEvents();
        // Realize qualquer ação necessária após a exclusão do evento
      } else {
        console.error("Erro ao deletar o evento:", response.statusText);
        // Lide com o erro de exclusão do evento adequadamente
      }
    })
    .catch((error) => {
      console.error("Erro ao fazer a requisição DELETE:", error);
      // Lide com o erro de requisição adequadamente
    });

  console.log(`Excluir evento na data: ${date}`);
}

function toggleShowAllEvents() {
  showAllEvents = !showAllEvents;
  closeAgenda();
}

// TODO: Implementar a função de deletar um paciente
// TODO: Implementar a filtos
async function loadEvents(patient) {

  let patientCpf = patient?.cpf

  let response = await fetch(`${apiUrl}/patient/${patientCpf}/calendar`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
  });

  let events = await response.json();

  if (!showAllEvents) {
    let today = new Date();
    today.setUTCHours(0, 0, 0, 0);
  
    events = events.filter(event => {
      let eventDate = new Date(event.date);
      eventDate.setDate(eventDate.getDate() + 1); // Adianta um dia
  
      return eventDate >= today;
    });
  }

  events = events.sort(function (eventA, eventB) {
    let date1 = new Date(eventA.date);
    let date2 = new Date(eventB.date);

    if (date1 < date2) {
      return -1;
    } else if (date1 > date2) {
      return 1;
    } else {
      return 0;
    }
  });

  let eventsDiv = document.querySelector(".events-agenda");
  eventsDiv.innerHTML = "";

  for (let i in events) {
    let date = events[i].date;
    let eventsOnDate = events[i].schedules;
    eventsOnDate = eventsOnDate.sort(function (eventA, eventB) {
      if (eventA.time < eventB.time) {
        return -1;
      } else if (eventA.time > eventB.time) {
        return 1;
      } else {
        return 0;
      }
    });
    let eventsOnDateDiv = document.createElement("div");
    eventsOnDateDiv.className = "events-on-date";

    let dateDiv = document.createElement("div");
    dateDiv.className = "date";
    // dateDiv.innerHTML += `<button class="delete-event-button" onclick="deleteEventOnClick(event, '${date}')">X</button>`;
    dateDiv.innerHTML += date;

    eventsOnDateDiv.appendChild(dateDiv);
    
    for (let event of eventsOnDate) {
      console.log(event)
      let eventDiv = document.createElement("div");
      eventDiv.className = "event";
      eventDiv.innerHTML = `<span class="hour">${event.caregiver.name}</span><span class="hour">${event.time}</span><span class="observation">${event.observation}</span><span class="category">${event.category}</span>`;

      eventsOnDateDiv.appendChild(eventDiv);
    }

    eventsDiv.appendChild(eventsOnDateDiv);
  }
}

async function openAgenda(patientCpf) {
  addPatientPopup.style.display = "none";

  let agendaDivName = document.querySelector("#agendaName");
  let currentPatient = await loadPatient(patientCpf);

  agendaDivName.innerHTML = `Agenda de ${currentPatient?.name}`;

  let agendaDiv = document.querySelector(".popup-agenda");
  agendaDiv.style.display = "block";

  let closeAgendaButton = document.querySelector("#close-agenda-button");
  closeAgendaButton?.addEventListener("click", () => {
    if (agendaDiv) {
      isEditingAgenda = false;
      closeAgenda();
    }
  });

  const toggleAlleventsButton = document.querySelector("#toggleShowAllEvents");
  toggleAlleventsButton?.addEventListener("click", () => {
    toggleShowAllEvents();
  });

  loadEvents(currentPatient); //here I load the events of a client

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

  let typeOfEventElement = document.querySelector("#typeOfEvent");
  let typeOfEvent = typeOfEventElement.value;

  typeOfEventElement.addEventListener("change", function () {
    typeOfEvent = typeOfEventElement.value;
  });

  let addEventButton = document.querySelector("#addEventButton");
  addEventButton?.addEventListener("click", () => {
    let eventObj = {
      hour: time,
      observation: description,
      category: typeOfEvent,
    };

    try {
      addEvent(currentPatient, currentClient, date, eventObj);
    } catch (error) {
      console.log(error);
    }
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

async function addEvent(patient, client, date, event) {
  if (eventParamsCheck(date, event)) {
    alert("Parametros invalidos! Data e/ou horario vazio(s)");
    return;
  }

  let response = await fetch(`${apiUrl}/patient/${patient.cpf}/calendar`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
  });

  let patientCalendar = await response.json();

  if (date in patientCalendar) {
    console.log("date already exists in calendar");
  }
  // Update the client calendar
  fetch(`${apiUrl}/patient/${patient.cpf}/schedule`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
    body: JSON.stringify({
      date: date,
      time: event.hour,
      observation: event.observation,
      category: event.category,
    }),
  }).then((response) => {
    if (response.status === 200) {
      alert("Evento adicionado com sucesso!"); //to the user
      console.log("Calendário atualizado"); //to the developer
      window.location = "dashboard.html";
      return;
    } else {
      alert("Erro ao atualizar o calendário!"); //to the user
      console.error("Erro ao atualizar o calendário"); //to developer
    }
  });
}

// showPatientProfile: Function that opens the popup to show the patient complete profile
function showPatientProfile(patient) {
  const cpf = patient?.cpf;
  const name = patient?.name;
  const age = patient?.age;
  const comorbiditiesNames = [];
  const complexProceduresNames = [];

  let comorbiditiesList = patient?.comorbidities;
  let comorbiditiesString = "";
  comorbiditiesList.forEach((comorbidit) => {
    comorbiditiesNames.push(comorbidit.description.trim());
    comorbiditiesString += comorbidit.description.trim();
    if (comorbidit != comorbiditiesList[comorbiditiesList.length - 1]) {
      comorbiditiesString += ", ";
    }
  });
  let proceduresList = patient?.complexProcedures;
  let complexProceduresString = "";
  proceduresList.forEach((procedure) => {
    complexProceduresNames.push(procedure.description.trim());
    complexProceduresString += procedure.description.trim();
    if (procedure != proceduresList[proceduresList.length - 1]) {
      complexProceduresString += ", ";
    }
  });

  const popupElemento = document.createElement("div");
  popupElemento.className = "popup";
  popupElemento.innerHTML = `
      <span class="closeButton">X</span>
      <span class="editButton">EDITAR</span>
      <span class="agendaButton">AGENDA</span>
      <h1 class="name-patient-profile">Sr(a) ${name}</h1>
      <div class=patient-info>
        <h3><u>CPF</u>: ${cpf}</h3>
        <h3><u>Nome</u>: ${name}</h3>
        <h3><u>Idade</u>: ${age}</h3>
        <h3><u>Comorbidades</u>: ${comorbiditiesString}</h3>
        <h3><u>Procedimentos</u>: ${complexProceduresString}</h3>
      </div>
    `;
  popupElemento.style.display = "block";
  document.body.appendChild(popupElemento);

  const editButton = popupElemento.querySelector(".editButton");
  const agendaButton = popupElemento.querySelector(".agendaButton");
  const closeButton = popupElemento.querySelector(".closeButton");
  const editPopup = document.createElement("div");
  editPopup.className = "popup-edit";

  popupElemento.appendChild(editPopup);

  agendaButton.addEventListener("click", () => {
    popupElemento.remove();
    openAgenda(cpf); //TODO: fazer abrir agenda do paciente, aquin esta abrindo a agenda do cuidador.
    //talvez criar um metodo identido so que usando o cpf do paciente e usando o endpoint adequado
  });

  closeButton.addEventListener("click", () => {
    popupElemento.remove();
  });

  editButton.addEventListener("click", () => {
    editPopup.style.display = "block";
    editPopup.innerHTML = `
      <button id="closeButton">&#10006;</button>
      <h3>Editar paciente</h3>
      <h4>Nome</h4>
      <input id="edit-patient-name" value="${
        patient?.name
      }" class="agenda-input" type="text"/>
      <h4>Idade</h4>
      <input id="edit-patient-age" value="${
        patient?.age
      }" class="agenda-input" type="text"/>
      <h4>Comorbidade</h4>
      <input id="edit-patient-comorbidities" value="${comorbiditiesNames.join(
        ", "
      )}" class="agenda-input" type="text"/>
      <h4>Procedimentos</h4>
      <input id="edit-patient-procedures" value="${complexProceduresNames.join(
        ", "
      )}" class="agenda-input" type="text"/>
      <button id="confirmButton">CONFIRMAR EDICAO</button>
    `;

    const confirmButton = editPopup.querySelector("#confirmButton");
    const closeButton = editPopup.querySelector("#closeButton");
    closeButton.addEventListener("click", () => {
      editPopup.style.display = "none";
    });
    confirmButton.addEventListener("click", () => {
      let patientName = editPopup.querySelector("#edit-patient-name").value;
      let patientAge = editPopup.querySelector("#edit-patient-age").value;
      let patientComorbidities = editPopup.querySelector(
        "#edit-patient-comorbidities"
      ).value;
      let patientProcedures = editPopup.querySelector(
        "#edit-patient-procedures"
      ).value;

      editPatient(
        patient,
        patientName,
        patientAge,
        patientComorbidities,
        patientProcedures
      );
    });
  });
}

async function editPatient(
  patient,
  patientName,
  patientAge,
  patientComorbidities,
  patientProced
) {
  let comorbititiesList = [];
  let complexProceduresList = [];

  patientComorbidities.split(",").forEach((comorbiditie) => {
    comorbititiesList.push({ description: comorbiditie });
  });

  patientProced.split(",").forEach((procedure) => {
    complexProceduresList.push({ description: procedure });
  });

  const patientUpdated = {
    cpf: patient.cpf,
    name: patientName,
    age: patientAge,
    comorbidities: comorbititiesList,
    complexProcedures: complexProceduresList,
  };

  const editedPatient = await fetch(`${apiUrl}/patient`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
    body: JSON.stringify(patientUpdated),
  });
  if (editedPatient.status === 200) {
    alert("O paciente foi atualizado com sucesso!");
    window.location.reload();
    return; // ends the function
  } else {
    alert("Ocorreu um erro ao atualizar o paciente");
  }
}

//ADD PATIENTS

const agendaDiv = document.querySelector(".popup-agenda");
const addPatientButton = document.getElementById("addPatientButton");
const addPatientPopup = document.getElementById("addPatientPopup");
const closeButton = document.querySelector(".closeButton");
closeButton.addEventListener("click", () => {
  addPatientPopup.style.display = "none";
});
const confirmButton = document.getElementById("confirmButton");

addPatientButton.addEventListener("click", () => {
  agendaDiv.style.display = "none";
  addPatientPopup.style.display = "block";
});

/**
 * Event listener para o botão de confirmação do popup de adicionar paciente
 * Captura os dados no popup e adiciona o paciente caso ele nao exista
 * Apos enviar os dados para o metodo addPatient, o popup é fechado
 */
confirmButton.addEventListener("click", () => {
  try {
    const cpf = document.getElementById("cpf").value;
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const comorbitities = document.getElementById("comorbitities").value;
    const complexProcedures =
      document.getElementById("complexProcedures").value;

    addPatient(cpf, name, age, comorbitities, complexProcedures);
    addPatientPopup.style.display = "none";
  } catch (error) {
    alert(error.message || "Erro ao adicionar paciente!");
    console.log(error);
  }
});

async function addPatient(cpf, name, age, comorbidities, complexProcedures) {
  let comorbititiesList = [];
  let complexProceduresList = [];

  comorbidities.split(",").forEach((comorbiditie) => {
    comorbititiesList.push({ description: comorbiditie });
  });

  complexProcedures.split(",").forEach((procedure) => {
    complexProceduresList.push({ description: procedure });
  });

  const newPatient = {
    cpf: cpf,
    name: name,
    age: age,
    comorbidities: comorbititiesList,
    complexProcedures: complexProceduresList,
  };

  try {
    // const alreadyRegistered = await fetch(`${apiUrl}/patient/${cpf}`, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: localStorage.getItem("token"),
    //   },
    // });
    // if (alreadyRegistered.status === 200) {
    //   alert("Um paciente com o mesmo CPF já está cadastrado!");
    //   return; // Retorna sem adicionar o paciente, encontrou um com o mesmo CPF
    // }

    const response = await fetch(`${apiUrl}/patient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(newPatient),
    });

    if (response.ok) {
      // If the patient was added successfully
      loadPatients(); // Reload the patients list to show the new patient
      alert("Paciente adicionado com sucesso!");
    } else {
      // If the patient was NOT added successfully
      alert("Erro ao adicionar paciente");
    }
  } catch (error) {
    console.log("Erro ao adicionar paciente:", error);
  }
}

//method to delete patient, called when the delete RED button is clicked, on patient card
function deletePatientOnClick(event, cpf) {
  let cpfString = cpf.toString().padStart(11, "0");
  console.log("deletePatientOnClick", cpfString);
  event.stopPropagation();
  deletePatient(cpfString);
}

async function deletePatient(cpfToDelete) {
  try {
    // Verificar se o paciente existe antes de excluir
    const response = await fetch(`${apiUrl}/patient/${cpfToDelete}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    });
    const patientJson = await response.json();
    const patientCpf = patientJson.cpf; // Supondo que a API retorna um campo "id" para cada paciente

    if (!patientJson) {
      console.log("Paciente não encontrado!");
      return; // Retorna sem excluir o paciente
    }

    // Excluir o paciente caso seja encontrado
    const deleteResponse = await fetch(`${apiUrl}/patient/${patientCpf}`, {
      method: "DELETE",
      body: JSON.stringify({ cpf: patientCpf }),
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    });

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
 * funtion to logout the caregiver
 */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userID");
  localStorage.removeItem("userName");
  window.location = "index.html";
}

/**
 * this function get the name of the logged user and show in the page
 */
async function getName() {
  const userName = localStorage.getItem("userName");
  const nameDisplay = document.getElementById("clientName");
  nameDisplay.innerHTML = `Sr(a). ${userName}`;
}
window.addEventListener("load", getName);

/**
 * Method to open the caregiver profile
 */
// async function openProfile() {
//   closeAgenda();
//   closeButton.addEventListener("click", () => {
//     popupElemento.remove();
//   });

//   let localCourrentClient = await globalCourrentClient;
//   var novoElemento = document.createElement("div");
//   novoElemento.className = "profile-card";
//   novoElemento.innerHTML = `<h1>Cuidador</h1><br/><h2>Nome: ${localCourrentClient?.name} </h2><h2>Experiência: ${localCourrentClient.monthsExperience} </h2><h2>CPF:  ${localCourrentClient.cpf}</h2><h2>Telefone: ${localCourrentClient.phone} </h2><h2>Email:  ${localCourrentClient.email}</h2>`;

//   var main = document.querySelector(".main-content");
//   main.innerHTML = "";
//   main.appendChild(novoElemento);
// }

document.addEventListener("DOMContentLoaded", function () {
  var tooltips = document.querySelectorAll(".tooltip");

  tooltips.forEach(function (tooltip) {
    var tooltipText = tooltip.querySelector(".tooltiptext");
    tooltipText.style.visibility = "visible";
    tooltipText.style.opacity = 1;

    setTimeout(function () {
      tooltipText.style.visibility = "hidden";
      tooltipText.style.opacity = 0;
    }, 8000);
  });
});
