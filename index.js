import express from "express";
import dotenv from "dotenv";
import moment from "moment-timezone";
import cors from "cors";
import conductorRoutes from "./routes/conductorRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import generoRoutes from "./routes/generoRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

moment.tz.setDefault("America/Argentina/Buenos_Aires");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/conductores", conductorRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/roles", rolesRoutes);
app.use("/generos", generoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT} :D`);
});
