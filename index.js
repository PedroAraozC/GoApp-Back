// index.js
import express from "express";
import http from "http";
import dotenv from "dotenv";
import moment from "moment-timezone";
import cors from "cors";
import path from "path";

import conductorRoutes from "./routes/conductorRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import generoRoutes from "./routes/generoRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import viajesRoutes from "./routes/viajesRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import tipoVehiculoRoutes from "./routes/tipoVehiculoRoutes.js";
import tarifaRoutes from "./routes/tarifasRoutes.js";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket
import setupSocket from "./socket.js"; // 👈 Importamos socket.js

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

moment.tz.setDefault("America/Argentina/Buenos_Aires");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use("/usuarios", usuarioRoutes);
app.use("/roles", rolesRoutes);
app.use("/conductores", conductorRoutes);
app.use("/generos", generoRoutes);
app.use("/viajes", viajesRoutes);
app.use("/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "imagenes")));
app.use("/tipoVehiculo", tipoVehiculoRoutes);
app.use("/tarifas", tarifaRoutes);

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
