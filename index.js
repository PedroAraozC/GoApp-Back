const express = require("express");
const dotenv = require("dotenv");
const moment = require("moment-timezone");
const cors = require("cors");
const conductorRoutes = require("./routes/conductorRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const rolesRoutes = require("./routes/rolesRoutes")
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT} :D`);
});
