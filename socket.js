// socket.js
import { Server } from "socket.io";
import { guardarMensaje } from "./controllers/chatController.js";

export default function setupSocket(server, app) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Permitir ambos transportes
    allowEIO3: true, // Compatibilidad con versiones anteriores
    pingTimeout: 60000, // 60 segundos
    pingInterval: 25000, // 25 segundos
  });

  console.log("🔌 Socket.IO configurado y listo para conexiones");

  // Guardamos io en Express para usarlo en los controladores (viajesControllers, etc.)
  app.set("io", io);
  const choferesActivos = new Map();

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

      // Chofer → sala "conductores" + sala individual
      if (tipo === "conductor") {
        socket.join("conductores");
        socket.join(`conductor_${id_usuario}`);
        console.log(
          `🚕 Conductor ${id_usuario} unido a salas "conductores" y "conductor_${id_usuario}"`,
        );
        console.log(
          `📌 [Socket] Rooms del conductor ${id_usuario}:`,
          Array.from(socket.rooms),
        );
      }

      // Pasajero → sala "pasajeros" + sala individual
      if (tipo === "pasajero") {
        socket.join("pasajeros");
        socket.join(`pasajero_${id_usuario}`);
        console.log(
          `🧍 Pasajero ${id_usuario} unido a salas "pasajeros" y "pasajero_${id_usuario}"`,
        );
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
        socket.leave(`conductor_${id_usuario}`);
        console.log(
          `🚕 Conductor ${id_usuario} salió de "conductores" y "conductor_${id_usuario}"`,
        );
      }

      if (tipo === "pasajero") {
        socket.leave("pasajeros");
        socket.leave(`pasajero_${id_usuario}`);
        console.log(
          `🧍 Pasajero ${id_usuario} salió de "pasajeros" y "pasajero_${id_usuario}"`,
        );
      }

      console.log("📌 Rooms luego de salir:", socket.rooms);
    });

    // Unirse a un room por ID de viaje (para seguimiento en tiempo real)
    socket.on("join_viaje", ({ id_viaje, user_id, tipo }) => {
      const room = `viaje_${id_viaje}`;
      socket.join(room);
      console.log(
        `📍 Usuario ${user_id} (${tipo}) unido a room ${room} para seguimiento`,
      );

      // Notificar a otros usuarios en el viaje
      socket.to(room).emit("usuario_unido_viaje", {
        id_viaje,
        user_id,
        tipo,
        timestamp: new Date().toISOString(),
      });
    });

    // Salir del room de viaje
    socket.on("leave_viaje", ({ id_viaje, user_id }) => {
      const room = `viaje_${id_viaje}`;
      socket.leave(room);
      console.log(`📍 Usuario ${user_id} salió del room ${room}`);
    });

    // ========================================
    // JOIN A ROOM DE CHAT
    // ========================================
    socket.on("join_chat", (data) => {
      const { idViaje, idUsuario, tipo } = data;

      if (!idViaje || !idUsuario) {
        console.log("❌ join_chat sin idViaje/idUsuario");
        return;
      }

      const room = `viaje_${idViaje}`;
      socket.join(room);

      console.log(`📌 Usuario ${idUsuario} (${tipo}) se unió a room ${room}`);

      // Avisar al otro usuario que alguien entró
      io.to(room).emit("user_joined", {
        idUsuario,
        tipo,
        mensaje: `${tipo} se unió al chat`,
      });
    });

    // ========================================
    // ENVÍO DE MENSAJES
    // ========================================
    socket.on("send_message", async (data) => {
      const { idViaje, idEmisor, mensaje } = data;

      if (!idViaje || !idEmisor || !mensaje) {
        console.log("❌ send_message datos incompletos");
        return;
      }

      const room = `viaje_${idViaje}`;

      console.log(`✉️ Mensaje en ${room} de ${idEmisor}: ${mensaje}`);

      try {
        // Guardar mensaje usando el controller
        await guardarMensaje(idViaje, idEmisor, mensaje);

        // Reenviar mensaje al otro usuario
        io.to(room).emit("new_message", {
          idViaje,
          idEmisor,
          mensaje,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error("❌ Error guardando mensaje:", err);
      }
    });

    // ================================
    // DESCONEXIÓN FÍSICA (cerrar app, perder internet, etc.)
    // ================================
    socket.on("disconnect", (reason) => {
      console.log("🔴 Cliente desconectado:", socket.id, "Motivo:", reason);
      const id = socket.data?.id_usuario;
      const tipo = socket.data?.tipo;

      if (tipo === "conductor" && id) {
        choferesActivos.delete(id);

        io.emit("choferes_ubicacion", Array.from(choferesActivos.values()));
      }
      // Podrías usar socket.data.id_usuario / tipo si querés hacer limpieza extra
    });

    // ========================================
    // SEGUIMIENTO EN TIEMPO REAL DE UBICACIÓN
    // ========================================
    socket.on("ubicacion_actualizada", (data) => {
      const idViaje =
        data?.id_viaje ?? data?.idViaje ?? data?.id_viajes ?? data?.id;
      const lat = data?.lat;
      const lng = data?.lng;
      const idUsuario = data?.id_usuario ?? data?.idUsuario;
      const tipo = data?.tipo;

      if (
        idViaje == null ||
        lat == null ||
        lng == null ||
        idUsuario == null ||
        !tipo
      ) {
        console.log("❌ ubicacion_actualizada datos incompletos", data);
        return;
      }

      // 🔥 SOLO choferes
      if (tipo === "conductor") {
        choferesActivos.set(idUsuario, {
          id: idUsuario,
          lat: Number(lat),
          lng: Number(lng),
        });

        // 🔥 EMITE A TODO EL BACKOFFICE
        io.emit("choferes_ubicacion", Array.from(choferesActivos.values()));
      }

      const room = `viaje_${idViaje}`;

      io.to(room).emit("ubicacion_en_tiempo_real", {
        id_viaje: Number(idViaje),
        lat: Number(lat),
        lng: Number(lng),
        id_usuario: Number(idUsuario),
        tipo,
        timestamp: new Date().toISOString(),
      });
    });

    // ================================
    // BOTÓN ANTIPÁNICO 911
    // ================================
    socket.on("panic_911", (data) => {
      const { id_usuario, lat, lng, ts } = data || {};
      console.log("🚨 PANIC 911:", { id_usuario, lat, lng, ts });

      io.to("admins").emit("panic_911", {
        id_usuario,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
        ts: ts || new Date().toISOString(),
      });
    });
  });

  return io;
}
