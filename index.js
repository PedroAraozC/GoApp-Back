import express from "express";
import dotenv from "dotenv";
import moment from "moment-timezone";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Rutas
import usuarioRoutes from "./routes/usuarioRoutes.js";
import viajesRoutes from "./routes/ViajesRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import generoRoutes from "./routes/generoRoutes.js";
import pagosRoutes from "./routes/pagosRoutes.js";
import conductorRoutes from "./routes/conductorRoutes.js";
import estadosRoutes from "./routes/estadosRoutes.js";
import { cancelarViajeSocket } from "./controllers/viajesControllers.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// 🔥 Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ Ajustá según tu frontend (ej. "http://localhost:5173" o tu dominio)
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io); // ✅ Hace que los controladores puedan usar Socket.IO

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Rutas
app.use("/usuarios", usuarioRoutes);
app.use("/pagos", pagosRoutes);
app.use("/viajes", viajesRoutes);
app.use("/roles", rolesRoutes);
app.use("/conductores", conductorRoutes);
app.use("/generos", generoRoutes);
app.use("/estados", estadosRoutes);

// 🔥 Eventos globales de conexión
io.on("connection", (socket) => {
  socket.on("usuario_conectado", (data) => {
    console.log("🟢 Usuario conectado:", data);
    io.emit("usuario_estado", { ...data, conectado: true });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado");
  });

  socket.on("viaje_cancelado", async (data) => {
    console.log("📨 Recibido evento 'viaje_cancelado' desde cliente:", data);
    await cancelarViajeSocket(io, data);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
