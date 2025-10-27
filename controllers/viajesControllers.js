import { conectarBDMySql } from "../config/dbMYSQL.js";

/**
 * POST /viajes/iniciar
 * body: { id_usuario, origen_lat, origen_lng, destino_lat?, destino_lng?, direccion_origen?, direccion_destino?, precio_estimado? }
 * Crea el viaje en estado "buscando"
 */
const iniciarViaje = async (req, res) => {
  let connection;
  console.log(req.body, "body :)");
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
  } finally {
    if (connection) await connection.end();
  }
};

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
  } finally {
    if (connection) await connection.end();
  }
};

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
  } finally {
    if (connection) await connection.end();
  }
};

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
  } finally {
    if (connection) await connection.end();
  }
};

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
  } finally {
    if (connection) await connection.end();
  }
};

export {
  iniciarViaje,
  obtenerViaje,
  obtenerViajesUsuario,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje
};
