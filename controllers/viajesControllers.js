<<<<<<< HEAD
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
=======
import { conectarBDMySql } from "../config/dbMYSQL.js";

/**
 * POST /viajes/iniciar
 * body: { id_usuario, origen_lat, origen_lng, destino_lat?, destino_lng?, direccion_origen?, direccion_destino?, precio_estimado? }
 * Crea el viaje en estado "buscando"
 */
const iniciarViaje = async (req, res) => {
  let connection;
  console.log(req.body, "body :)");
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
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
<<<<<<< HEAD
    } = req.body;

    if (!id_usuario || origen_lat == null || origen_lng == null) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios (id_usuario, origen_lat, origen_lng)",
      });
    }

    connection = await conectarBDMySql();
    /* Paso 1 */
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
=======
      notas = null,
    } = req.body;

    if (!id_usuario || !origen_lat || !origen_lng) {
      return res.status(400).json({ message: "Faltan datos obligatorios (id_usuario, origen_lat, origen_lng)" });
    }

    connection = await conectarBDMySql();
    const [result] = await connection.execute(
      `INSERT INTO viajes
       (id_usuario, origen_lat, origen_lng, destino_lat, destino_lng, direccion_origen, direccion_destino, precio_estimado, notas, estado)
       VALUES (?,?,?,?,?,?,?,?,?, 'buscando')`,
      [id_usuario, origen_lat, origen_lng, destino_lat, destino_lng, direccion_origen, direccion_destino, precio_estimado, notas]
    );

    const id_viaje = result.insertId;
    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id_viaje]);

    // Respuesta: el frontend ahora puede mostrar "Buscando viaje..." y hacer polling a /viajes/:id
    res.status(201).json({ result: rows[0], message: "Viaje iniciado en estado 'buscando'." });
  } catch (error) {
    console.error("❌ iniciarViaje:", error);
    res.status(500).json({ message: "Error al iniciar viaje: " + error.message });
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
  } finally {
    if (connection) await connection.end();
  }
};

<<<<<<< HEAD
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
=======
/**
 * GET /viajes/:id
 * Devuelve el detalle del viaje (sirve para el polling de la pantalla “Buscando viaje”)
 */
const obtenerViaje = async (req, res) => {
  let connection;
  console.log(req.body, "body :)");
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();
    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Viaje no encontrado" });
    res.json({ result: rows[0] });
  } catch (error) {
    console.error("❌ obtenerViaje:", error);
    res.status(500).json({ message: "Error al obtener viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * GET /viajes/usuario/:id_usuario?estado=finalizado
 * Lista viajes del usuario (historial = 'finalizado' por defecto)
 */
const obtenerViajesUsuario = async (req, res) => {
  let connection;
  try {
    const { id_usuario } = req.params;
    const { estado = "finalizado" } = req.query;

    connection = await conectarBDMySql();
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_usuario = ? AND estado = ? ORDER BY fecha_fin DESC",
      [id_usuario, estado]
    );
    res.json({ result: rows });
  } catch (error) {
    console.error("❌ obtenerViajesUsuario:", error);
    res.status(500).json({ message: "Error al listar viajes: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * PUT /viajes/:id/asignar
 * body: { id_conductor }
 * Asigna conductor al viaje y cambia a 'asignado'
 */
const asignarConductor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_conductor } = req.body;
    if (!id_conductor) return res.status(400).json({ message: "id_conductor es requerido" });

    connection = await conectarBDMySql();

    const [exists] = await connection.execute("SELECT estado FROM viajes WHERE id_viaje = ?", [id]);
    if (exists.length === 0) return res.status(404).json({ message: "Viaje no encontrado" });
    if (exists[0].estado !== "buscando")
      return res.status(400).json({ message: "Solo se puede asignar un conductor cuando el viaje está en 'buscando'" });

    await connection.execute(
      "UPDATE viajes SET id_conductor = ?, estado = 'asignado' WHERE id_viaje = ?",
      [id_conductor, id]
    );

    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);
    res.json({ result: rows[0], message: "Conductor asignado" });
  } catch (error) {
    console.error("❌ asignarConductor:", error);
    res.status(500).json({ message: "Error al asignar conductor: " + error.message });
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
  } finally {
    if (connection) await connection.end();
  }
};

<<<<<<< HEAD

/** PUT /viajes/:id/comenzar */
const comenzarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes

    connection = await conectarBDMySql();

    const [updateResult] = await connection.execute(
      `UPDATE viajes
       SET id_estado = 2,
           hora_inicio = NOW()
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
=======
/**
 * PUT /viajes/:id/comenzar
 * Cambia a 'en_curso' y setea fecha_inicio
 */
const comenzarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();

    const [exists] = await connection.execute("SELECT estado FROM viajes WHERE id_viaje = ?", [id]);
    if (exists.length === 0) return res.status(404).json({ message: "Viaje no encontrado" });
    if (!["asignado"].includes(exists[0].estado))
      return res.status(400).json({ message: "Solo se puede comenzar un viaje 'asignado'" });

    await connection.execute(
      "UPDATE viajes SET estado = 'en_curso', fecha_inicio = NOW() WHERE id_viaje = ?",
      [id]
    );

    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);
    res.json({ result: rows[0], message: "Viaje en curso" });
  } catch (error) {
    console.error("❌ comenzarViaje:", error);
    res.status(500).json({ message: "Error al comenzar viaje: " + error.message });
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
  } finally {
    if (connection) await connection.end();
  }
};

<<<<<<< HEAD

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
           hora_fin = NOW(),
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
=======
/**
 * PUT /viajes/:id/finalizar
 * body: { precio_final?, distancia_km?, duracion_min? }
 * Cambia a 'finalizado' y setea fecha_fin
 */
const finalizarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { precio_final = null, distancia_km = null, duracion_min = null } = req.body;

    connection = await conectarBDMySql();

    const [exists] = await connection.execute("SELECT estado FROM viajes WHERE id_viaje = ?", [id]);
    if (exists.length === 0) return res.status(404).json({ message: "Viaje no encontrado" });
    if (!["en_curso","asignado"].includes(exists[0].estado))
      return res.status(400).json({ message: "Solo se puede finalizar un viaje 'en_curso' o 'asignado'" });

    await connection.execute(
      `UPDATE viajes
       SET estado = 'finalizado', fecha_fin = NOW(),
           precio_final = COALESCE(?, precio_final),
           distancia_km = COALESCE(?, distancia_km),
           duracion_min = COALESCE(?, duracion_min)
       WHERE id_viaje = ?`,
      [precio_final, distancia_km, duracion_min, id]
    );

    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);
    res.json({ result: rows[0], message: "Viaje finalizado" });
  } catch (error) {
    console.error("❌ finalizarViaje:", error);
    res.status(500).json({ message: "Error al finalizar viaje: " + error.message });
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
  } finally {
    if (connection) await connection.end();
  }
};

<<<<<<< HEAD

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
=======
/**
 * PUT /viajes/:id/cancelar
 * Cambia a 'cancelado'
 */
const cancelarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();

    const [exists] = await connection.execute("SELECT estado FROM viajes WHERE id_viaje = ?", [id]);
    if (exists.length === 0) return res.status(404).json({ message: "Viaje no encontrado" });
    if (exists[0].estado === "finalizado")
      return res.status(400).json({ message: "No se puede cancelar un viaje finalizado" });

    await connection.execute("UPDATE viajes SET estado = 'cancelado' WHERE id_viaje = ?", [id]);

    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);
    res.json({ result: rows[0], message: "Viaje cancelado" });
  } catch (error) {
    console.error("❌ cancelarViaje:", error);
    res.status(500).json({ message: "Error al cancelar viaje: " + error.message });
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
  } finally {
    if (connection) await connection.end();
  }
};

<<<<<<< HEAD

module.exports = {
  iniciarViaje,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje,
=======
export {
  iniciarViaje,
  obtenerViaje,
  obtenerViajesUsuario,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
};
