import { conectarBDMySql } from "../config/dbMYSQL.js";

/* ======================================================
   🔹 POST /viajes/iniciar → crea un viaje en “buscando”
   ====================================================== */
export const iniciarViaje = async (req, res) => {
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

    if (!id_usuario || !origen_lat || !origen_lng) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios (id_usuario, origen_lat, origen_lng)",
      });
    }

    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      `INSERT INTO viajes
       (id_pasajero, lat_desde, lon_desde, lat_hasta, lon_hasta, direccion_desde, direccion_hasta, valor, estado)
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
        5,
      ]
    );

    const id_viaje = result.insertId;
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id_viaje]
    );

    // 🔹 Emitir evento de nuevo viaje
    const io = req.app.get("io");
    io.emit("viaje_nuevo", rows[0]);

    res.status(201).json({
      result: rows[0],
      message: "Viaje iniciado correctamente en estado 'buscando'.",
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

/* ======================================================
   🔹 GET /viajes/:id → obtiene detalle de un viaje
   ====================================================== */
export const obtenerViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Viaje no encontrado" });
    res.json({ result: rows[0] });
  } catch (error) {
    console.error("❌ obtenerViaje:", error);
    res
      .status(500)
      .json({ message: "Error al obtener viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/* ======================================================
   🔹 GET /viajes/usuario/:id_usuario?estado=4
   ====================================================== */
export const obtenerViajesUsuario = async (req, res) => {
  let connection;
  try {
    const { id_usuario } = req.params;
    const { estado = 4 } = req.query;

    connection = await conectarBDMySql();
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_pasajero = ? AND estado = ? ORDER BY id_viajes DESC",
      [id_usuario, estado]
    );

    res.json({ result: rows });
  } catch (error) {
    console.error("❌ obtenerViajesUsuario:", error);
    res
      .status(500)
      .json({ message: "Error al listar viajes: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/* ======================================================
   🔹 PUT /viajes/:id/asignar → asigna conductor
   ====================================================== */
export const asignarConductor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_conductor } = req.body;

    if (!id_conductor)
      return res.status(400).json({ message: "id_conductor es requerido" });

    connection = await conectarBDMySql();

    const [exists] = await connection.execute(
      "SELECT estado FROM viajes WHERE id_viajes = ?",
      [id]
    );
    if (exists.length === 0)
      return res.status(404).json({ message: "Viaje no encontrado" });

    await connection.execute(
      "UPDATE viajes SET id_conductor = ?, estado = 1 WHERE id_viajes = ?",
      [id_conductor, id]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    // 🔹 Emitir evento
    const io = req.app.get("io");
    io.emit("viaje_asignado", rows[0]);

    res.json({ result: rows[0], message: "Conductor asignado correctamente" });
  } catch (error) {
    console.error("❌ asignarConductor:", error);
    res
      .status(500)
      .json({ message: "Error al asignar conductor: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/* ======================================================
   🔹 PUT /viajes/:id/comenzar → pasa a “en curso”
   ====================================================== */
export const comenzarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();

    const [exists] = await connection.execute(
      "SELECT estado FROM viajes WHERE id_viajes = ?",
      [id]
    );
    if (exists.length === 0)
      return res.status(404).json({ message: "Viaje no encontrado" });

    await connection.execute(
      "UPDATE viajes SET estado = 2, fecha_inicio = NOW() WHERE id_viajes = ?",
      [id]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const io = req.app.get("io");
    io.emit("viaje_en_curso", rows[0]);

    res.json({ result: rows[0], message: "Viaje en curso" });
  } catch (error) {
    console.error("❌ comenzarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al comenzar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/* ======================================================
   🔹 PUT /viajes/:id/finalizar → pasa a “finalizado”
   ====================================================== */
export const finalizarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      precio_final = null,
      distancia_km = null,
      duracion_min = null,
    } = req.body;

    connection = await conectarBDMySql();

    await connection.execute(
      `UPDATE viajes
       SET estado = 4, fecha_fin = NOW(),
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

    const io = req.app.get("io");
    io.emit("viaje_finalizado", rows[0]);

    res.json({ result: rows[0], message: "Viaje finalizado correctamente" });
  } catch (error) {
    console.error("❌ finalizarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al finalizar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/* ======================================================
   🔹 PUT /viajes/:id/cancelar → cambia a “cancelado”
   ====================================================== */
export const cancelarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();

    await connection.execute(
      "UPDATE viajes SET estado = 3 WHERE id_viajes = ?",
      [id]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const io = req.app.get("io");
    io.emit("viaje_cancelado", rows[0]);

    res.json({ result: rows[0], message: "Viaje cancelado correctamente" });
  } catch (error) {
    console.error("❌ cancelarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al cancelar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};
