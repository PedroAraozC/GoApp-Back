import express from "express";
import dotenv from "dotenv";
import moment from "moment-timezone";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// 🧩 Rutas
import conductorRoutes from "./routes/conductorRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import generoRoutes from "./routes/generoRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import viajesRoutes from "./routes/ViajesRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// =============================
// 🔧 Inicializar Socket.IO
// =============================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 🔐 más adelante restringilo a tu frontend
    methods: ["GET", "POST", "PUT"],
  },
});

// Guardamos el io en app para usarlo dentro de controladores
app.set("io", io);

// =============================
// 🌐 Eventos de Socket.IO
// =============================
io.on("connection", (socket) => {
  console.log("🟢 Nuevo cliente conectado:", socket.id);

  // 📍 Registro de usuario (pasajero o conductor)
  socket.on("registrar_usuario", ({ idUsuario, tipo }) => {
    console.log(`👤 Usuario conectado: ${idUsuario} (${tipo})`);
    socket.join(`usuario_${idUsuario}`);
  });

  // 🚕 Escuchar cuando se crea un viaje
  socket.on("viaje_creado", (data) => {
    console.log("🆕 Viaje creado:", data);
    io.emit("viaje_actualizado", data); // 🔁 notifica a todos los clientes conectados
  });

  // 🚗 Escuchar actualizaciones de viaje (ej: cambio de estado)
  socket.on("viaje_actualizado", (data) => {
    console.log("🔄 Viaje actualizado:", data);
    io.emit("viaje_actualizado", data);
  });

  // ❌ Cuando el cliente se desconecta
  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// =============================
// 🕒 Configuración general
// =============================
moment.tz.setDefault("America/Argentina/Buenos_Aires");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// 🧭 Rutas
// =============================
app.use("/conductores", conductorRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/roles", rolesRoutes);
app.use("/generos", generoRoutes);
app.use("/viajes", viajesRoutes);

// =============================
// 🚀 Inicio del servidor
// =============================
server.listen(PORT, () => {
  console.log(`🚀 Servidor + Socket corriendo en puerto ${PORT}`);
});
