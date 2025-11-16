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
    const { id } = req.params; // este id es id_viajes
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res
        .status(400)
        .json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Usamos SIEMPRE id_viajes como PK
    await connection.execute(
      "UPDATE viajes SET id_conductor = ?, estado = 1 WHERE id_viajes = ?",
      [id_conductor, id]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rows[0];

    emitir(req, "viaje_asignado", v);

    res.json({ result: v, message: "Conductor asignado" });
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

    await connection.execute(
      "UPDATE viajes SET estado = 2, fecha_inicio = NOW() WHERE id_viajes = ?",
      [id]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rows[0];

    emitir(req, "viaje_en_curso", v);
    res.json({ result: v, message: "Viaje en curso" });
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
    const {
      precio_final = null,
      distancia_km = null,
      duracion_min = null,
    } = req.body;

    connection = await conectarBDMySql();

    await connection.execute(
      `UPDATE viajes
       SET estado = 4,
           fecha_fin = NOW(),
           precio_final = COALESCE(?, precio_final),
           distancia_km = COALESCE(?, distancia_km),
           duracion_min = COALESCE(?, duracion_min)
       WHERE id_viajes = ?`,
      [precio_final, distancia_km, duracion_min, id]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rows[0];

    emitir(req, "viaje_finalizado", v);
    res.json({ result: v, message: "Viaje finalizado" });
  } catch (error) {
    console.error("❌ finalizarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al finalizar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  iniciarViaje,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
};
