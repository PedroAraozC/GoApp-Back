// socket.js
const { Server } = require("socket.io");

exports.setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Guardamos io en Express para usarlo en los controladores (viajesControllers, etc.)
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    // ================================
    // USUARIO CONECTADO (pasajero / conductor)
    // ================================
    socket.on("usuario_conectado", ({ id_usuario, tipo }) => {
      if (!id_usuario || !tipo) {
        console.log("⚠️ usuario_conectado sin id_usuario o tipo");
        return;
      }

      socket.data.id_usuario = id_usuario;
      socket.data.tipo = tipo;

      // Chofer → sala "conductores"
      if (tipo === "conductor") {
        socket.join("conductores");
        console.log(`🚕 Conductor ${id_usuario} unido a sala "conductores"`);
      }

      // Pasajero → sala "pasajeros" (opcional)
      if (tipo === "pasajero") {
        socket.join("pasajeros");
        console.log(`🧍 Pasajero ${id_usuario} unido a sala "pasajeros"`);
      }

      console.log("📌 Rooms actuales del socket:", socket.rooms);
    });

    // ================================
    // USUARIO DESCONECTADO (manual desde la app)
    // ================================
    socket.on("usuario_desconectado", ({ id_usuario, tipo }) => {
      console.log(`⚪ usuario_desconectado → id=${id_usuario}, tipo=${tipo}`);

      if (tipo === "conductor") {
        socket.leave("conductores");
        console.log(`🚕 Conductor ${id_usuario} salió de "conductores"`);
      }

      if (tipo === "pasajero") {
        socket.leave("pasajeros");
        console.log(`🧍 Pasajero ${id_usuario} salió de "pasajeros"`);
      }

      console.log("📌 Rooms luego de salir:", socket.rooms);
    });

    // ================================
    // DESCONEXIÓN FÍSICA (cerrar app, perder internet, etc.)
    // ================================
    socket.on("disconnect", (reason) => {
      console.log("🔴 Cliente desconectado:", socket.id, "Motivo:", reason);
      // Si quisieras, acá podrías chequear socket.data.tipo y sacarlo de rooms, etc.
    });
  });

  return io;
};
