"use strict";

/* Imports */
const express = require("express");
const bodyParser = require("body-parser");
const connectionOptions = require("./server/connectionOptions.json").server;
const requestHandlers = require("./server/request-handlers.js");
const mqtt = require("./server/mqtt.js");

/* Inicializar servidor & conecção ao mqtt broker */
const app = express();
const esp = mqtt();

/* Middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("www", {index:'login.html'}));

/* Routing */
app.get("/login", requestHandlers.userLogin); 
app.post("/login", requestHandlers.validaLogin); 
app.post("/user", requestHandlers.userCreate); 
app.get("/user/:id", requestHandlers.userData);
app.delete("/user/:id", requestHandlers.userDelete); 

/* Android */
app.post("/user/:id/avaliacao", requestHandlers.feedbackUser); 
app.get("/user/:id/cacifo", requestHandlers.userCacifo); 
app.put("/user/:id/pacote", requestHandlers.userEdit); 
app.put("/user/:id/user-cacifo", requestHandlers.userEdit); 
app.get("/user/:id/pagamento", requestHandlers.userPagamentosList); 
app.put("/pagamento/:id", requestHandlers.simularPagamento);

/* Web client */
app.get("/avaliacao", requestHandlers.feedbackList); 
app.get("/count-avaliacao", requestHandlers.countFeedback); 
app.get("/dados", requestHandlers.dadosDashboard);
app.get("/user", requestHandlers.usersList); 
app.get("/cacifo", requestHandlers.cacifosList); 
app.post("/cacifo", requestHandlers.cacifoCreate); 
app.put("/cacifo/:id", requestHandlers.cacifoEdit); 
app.delete("/cacifo/:id", requestHandlers.cacifoDelete); 
app.get("/pacote", requestHandlers.pacoteList); 
app.post("/pacote", requestHandlers.pacoteCreate); 
app.put("/pacote/:id", requestHandlers.pacoteEdit); 
app.delete("/pacote/:id", requestHandlers.pacoteDelete); 
app.get("/user-cacifo", requestHandlers.countDiarias); 
app.get("/consumo", requestHandlers.consumoMensal); 
app.get("/tempo-carga", requestHandlers.tempoCarga); 

/* Arduino */
app.put("/user-cacifo/:id", (req, res) => requestHandlers.detravarCacifo(req, res, esp)); 

/* Start server */
app.listen(connectionOptions.port, () => {
    console.log("Server running at http://localhost:" + connectionOptions.port);
});
