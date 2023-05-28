const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./db.json");

const corsOptions = {
  origin: "*", // Define o cabeçalho "Access-Control-Allow-Origin" para permitir todas as origens
  methods: ["GET", "POST", "PATCH", "DELETE"], // Inclui os métodos HTTP permitidos
  allowedHeaders: ["Content-Type"], // Define os cabeçalhos permitidos
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota para obter todos os pacientes
app.get("/patients", (req, res) => {
  const patients = db.patients;
  res.json(patients);
});

app.get("/clients", (req, res) => {
  const clientId = req.query.id;

  if (clientId) {
    const client = db.clients[clientId];
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ error: "Cliente não encontrado" });
    }
  }
});

// Rota para criar um novo cliente
app.post("/clients", (req, res) => {
  const clientData = req.body; // Dados do novo cliente

  // Lógica para criar um novo cliente no banco de dados

  res.json(clientData); // Retorna os dados do novo cliente como resposta
});

// Rota para atualizar um cliente específico
app.patch("/clients/:id", (req, res) => {
  const clientId = req.params.id;
  const updatedClientData = req.body; // Dados do cliente atualizados

  if (db.clients.hasOwnProperty(clientId)) {
    // Atualiza o calendário do cliente com os dados fornecidos
    db.clients[clientId].calendar = updatedClientData.calendar;

    const fs = require("fs");
    fs.writeFile("db.json", JSON.stringify(db), (err) => {
      if (err) {
        console.error("Erro ao salvar as alterações no arquivo db.json:", err);
        res.status(500).json({ error: "Erro ao salvar as alterações" });
      } else {
        console.log("Alterações salvas com sucesso no arquivo db.json");
        res.json(db.clients[clientId]); // Retorna os dados do cliente atualizados como resposta
      }
    });
  } else {
    res.status(404).json({ error: "Cliente não encontrado" });
  }
});

// Rota para deletar um cliente específico
app.delete("/clients/:id", (req, res) => {
  const clientId = req.params.id;

  // Lógica para deletar o cliente com o ID fornecido

  res.json({ message: "Cliente deletado com sucesso" }); // Retorna uma mensagem de sucesso como resposta
});

// Inicia o servidor
app.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});

// deletar um evento do calendário de um cliente específico
app.delete("/clients/:id/calendar/:date", (req, res) => {
  const clientId = req.params.id;
  const eventDate = req.params.date;

  if (db.clients.hasOwnProperty(clientId)) {
    const client = db.clients[clientId];
    const calendar = client.calendar;

    if (calendar.hasOwnProperty(eventDate)) {
      delete calendar[eventDate];
      // Você também pode adicionar a lógica para deletar o evento do seu sistema de armazenamento de dados

      const fs = require("fs");
      fs.writeFile("db.json", JSON.stringify(db), (err) => {
        if (err) {
          console.error(
            "Erro ao salvar as alterações no arquivo db.json:",
            err
          );
          res.status(500).json({ error: "Erro ao salvar as alterações" });
        } else {
          console.log("Evento deletado com sucesso");
          res.json({ message: "Evento deletado com sucesso" }); // Retorna uma mensagem de sucesso como resposta
        }
      });
    } else {
      res.status(404).json({ error: "Evento não encontrado" });
    }
  } else {
    res.status(404).json({ error: "Cliente não encontrado" });
  }
});
