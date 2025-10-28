import express from "express";
import dotenv from "dotenv";
import moment from "moment-timezone";
import cors from "cors";
import conductorRoutes from "./routes/conductorRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import generoRoutes from "./routes/generoRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import viajesRoutes from "./routes/ViajesRoutes.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // podés restringirlo a tu frontend luego
    methods: ["GET", "POST", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Nuevo cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

app.set("io", io);

moment.tz.setDefault("America/Argentina/Buenos_Aires");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/conductores", conductorRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/roles", rolesRoutes);
app.use("/generos", generoRoutes);
app.use("/viajes", viajesRoutes);

server.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
);
// app.listen(PORT, () => {
//   console.log(`🚀 Servidor escuchando en http://localhost:${PORT} :D`);
// });
