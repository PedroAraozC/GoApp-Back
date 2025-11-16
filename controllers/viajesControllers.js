// controllers/viajesControllers.js
const { conectarBDMySql } = require("../config/dbMYSQL");

// Helper para emitir eventos por Socket.IO (con room opcional)
const emitir = (req, evento, data, opciones = {}) => {
  const io = req.app.get("io");
  if (!io) return;

  const { room } = opciones;

  if (room) {
    // Emitir solo a un room (ej: "conductores")
    io.to(room).emit(evento, data);
  } else {
    // Emitir a todos
    io.emit(evento, data);
  }
};

/** POST /viajes/iniciarViaje */
const iniciarViaje = async (req, res) => {
  let connection;
  try {
    const {
      id_usuario,
      origen_lat,
      origen_lng,
      destino_lat = null,
      destino_lng = null,
      direccion_origen = null,
      direccion_destino = null,
      precio_estimado = null,
    } = req.body;

    if (!id_usuario || origen_lat == null || origen_lng == null) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios (id_usuario, origen_lat, origen_lng)",
      });
    }

    connection = await conectarBDMySql();

    // 1) Insertar el viaje en la BD
    const [result] = await connection.execute(
      `INSERT INTO viajes
       (id_pasajero,
        lat_desde, lon_desde,
        lat_hasta, lon_hasta,
        direccion_desde, direccion_hasta,
        valor, id_estado)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        id_usuario,
        origen_lat,
        origen_lng,
        destino_lat,
        destino_lng,
        direccion_origen,
        direccion_destino,
        precio_estimado,
        5, // 5 = "buscando" / pendiente
      ]
    );

    const id_viajes = result.insertId;

    // 2) Traer el registro completo recién creado
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id_viajes]
    );

    if (!rows || rows.length === 0) {
      return res.status(500).json({
        message: "No se encontró el viaje recién insertado.",
      });
    }

    const v = rows[0];

    // 3) Normalizar el objeto que se envía por socket
    const payloadSocket = {
      id_viajes: v.id_viajes ?? id_viajes,
      id_pasajero: v.id_pasajero ?? id_usuario,
      id_conductor: v.id_conductor ?? null,

      direccion_desde: v.direccion_desde ?? direccion_origen ?? "",
      lat_desde: Number(v.lat_desde ?? origen_lat),
      lon_desde: Number(v.lon_desde ?? origen_lng),

      direccion_hasta: v.direccion_hasta ?? direccion_destino ?? "",
      lat_hasta: Number(
        v.lat_hasta ?? destino_lat ?? v.lat_desde ?? origen_lat
      ),
      lon_hasta: Number(
        v.lon_hasta ?? destino_lng ?? v.lon_desde ?? origen_lng
      ),

      hora_inicio: v.hora_inicio ?? v.fecha_inicio ?? null,
      hora_fin: v.hora_fin ?? v.fecha_fin ?? null,

      valor: Number(v.valor ?? v.precio_final ?? precio_estimado ?? 0),
      id_estado: v.id_estado ?? v.estado ?? 5,
    };

    // 4) Emitir SOLO a conductores conectados (room "conductores")
    emitir(req, "viaje_creado", payloadSocket, { room: "conductores" });

    // 5) Responder al pasajero
    res.status(201).json({
      result: v,
      message: "Viaje iniciado en estado 'buscando'.",
    });
  } catch (error) {
    console.error("❌ iniciarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al iniciar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** POST /viajes/:id/aceptar (asignarConductor) */
const asignarConductor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res
        .status(400)
        .json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    const [updateResult] = await connection.execute(
      `UPDATE viajes
       SET id_conductor = ?, id_estado = 1
       WHERE id_viajes = ?
         AND id_estado = 5`, // 👈 solo se asignan viajes que estaban BUSCANDO
      [id_conductor, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Viaje no encontrado o en estado no válido para asignar (debe estar 'Buscando')",
      });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rows[0];

    // Emitir al pasajero y al conductor
    emitir(req, "viaje_asignado", v, { room: `pasajero_${v.id_pasajero}` });
    emitir(req, "viaje_asignado", v, { room: `conductor_${v.id_conductor}` });

    // Ya no está "Buscando", se lo sacamos del room general de conductores
    emitir(
      req,
      "viaje_dejado_de_buscar",
      { id_viajes: v.id_viajes },
      { room: "conductores" }
    );

    res.json({ message: "Viaje asignado correctamente", viaje: v });
  } catch (error) {
    console.error("❌ asignarConductor:", error);
    res
      .status(500)
      .json({ message: "Error al asignar conductor: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};


/** PUT /viajes/:id/comenzar */
const comenzarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes

    connection = await conectarBDMySql();

    const [updateResult] = await connection.execute(
      `UPDATE viajes
       SET id_estado = 2,
           fecha_inicio = NOW()
       WHERE id_viajes = ?
         AND id_estado = 1`, // 👈 estaba ASIGNADO
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Viaje no encontrado o en estado no válido para comenzar (debe estar 'Asignado')",
      });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );
    const v = rows[0];

    emitir(req, "viaje_en_curso", v, {
      room: `pasajero_${v.id_pasajero}`,
    });
    emitir(req, "viaje_en_curso", v, {
      room: `conductor_${v.id_conductor}`,
    });

    res.json({ message: "Viaje comenzado correctamente", viaje: v });
  } catch (error) {
    console.error("❌ comenzarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al comenzar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};


/** PUT /viajes/:id/finalizar */
const finalizarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { precio_final, precio_estimado } = req.body || {};

    connection = await conectarBDMySql();

    const precioFinalUsar = precio_final ?? precio_estimado ?? 0;

    const [updateResult] = await connection.execute(
      `UPDATE viajes
       SET id_estado = 4,
           fecha_fin = NOW(),
           precio_final = ?
       WHERE id_viajes = ?
         AND id_estado = 2`, // 👈 debe estar EN CURSO
      [precioFinalUsar, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Viaje no encontrado o en estado no válido para finalizar (debe estar 'En Curso')",
      });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rows[0];

    emitir(req, "viaje_finalizado", v, {
      room: `pasajero_${v.id_pasajero}`,
    });
    emitir(req, "viaje_finalizado", v, {
      room: `conductor_${v.id_conductor}`,
    });

    res.json({ message: "Viaje finalizado correctamente", viaje: v });
  } catch (error) {
    console.error("❌ finalizarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al finalizar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};


/** PUT /viajes/:id/cancelar */
/** PUT /viajes/:id/cancelar */
const cancelarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes

    connection = await conectarBDMySql();

    // 1) Traemos el viaje para saber su estado actual
    const [rowsPrev] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (rowsPrev.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const viajeAntes = rowsPrev[0];

    // Solo permitimos cancelar si está: BUSCANDO (5), ASIGNADO (1) o EN CURSO (2)
    if (![5, 1, 2].includes(viajeAntes.id_estado)) {
      return res.status(400).json({
        message:
          "Viaje en estado no válido para cancelar (ya finalizado o cancelado)",
      });
    }

    // 2) Actualizamos a CANCELADO (3)
    const [updateResult] = await connection.execute(
      `UPDATE viajes
       SET id_estado = 3,
           hora_fin = NOW()
       WHERE id_viajes = ?`,
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Viaje no encontrado o en estado no válido para cancelar (ej: ya finalizado)",
      });
    }

    // 3) Obtenemos el viaje actualizado
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rows[0];

    // 🔊 Notificar PASAJERO
    emitir(req, "viaje_cancelado", v, { room: `pasajero_${v.id_pasajero}` });

    // 🔊 Si tenía CONDUCTOR, notificarle
    if (v.id_conductor) {
      emitir(req, "viaje_cancelado", v, {
        room: `conductor_${v.id_conductor}`,
      });
    }

    // 🔊 Si ANTES estaba en "Buscando" (5), avisar a todos los conductores
    if (viajeAntes.id_estado === 5) {
      emitir(
        req,
        "viaje_cancelado_busqueda",
        { id_viajes: v.id_viajes },
        { room: "conductores" }
      );
    }

    res.json({ message: "Viaje cancelado exitosamente", viaje: v });
  } catch (error) {
    console.error("❌ cancelarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al cancelar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};


module.exports = {
  iniciarViaje,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje,
};
