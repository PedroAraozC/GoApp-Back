<<<<<<< HEAD
// index.js
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const moment = require("moment-timezone");
const cors = require("cors");

// Rutas
const conductorRoutes = require("./routes/conductorRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const generoRoutes = require("./routes/generoRoutes");
const rolesRoutes = require("./routes/rolesRoutes");
const viajesRoutes = require("./routes/viajesRoutes");

// Socket
const { setupSocket } = require("./socket"); // 👈 Importamos socket.js

=======
import express from "express";
import dotenv from "dotenv";
import moment from "moment-timezone";
import cors from "cors";
import conductorRoutes from "./routes/conductorRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import generoRoutes from "./routes/generoRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

moment.tz.setDefault("America/Argentina/Buenos_Aires");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use("/conductores", conductorRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/roles", rolesRoutes);
app.use("/generos", generoRoutes);
app.use("/viajes", viajesRoutes);

// ===============================
// 🔥 CONFIGURAR SERVIDOR HTTP + SOCKET.IO
// ===============================
const server = http.createServer(app);

// Socket.IO inicializado (pasa server + app)
setupSocket(server, app);

// ===============================
// 🔥 LEVANTAR SERVIDOR
// ===============================
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT} 🚕🔥`);
});
