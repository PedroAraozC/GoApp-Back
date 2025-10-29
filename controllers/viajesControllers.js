import { conectarBDMySql } from "../config/dbMYSQL.js";

const emitir = (req, evento, data) => {
  const io = req.app.get("io");
  if (io) io.emit(evento, data);
};

/** POST /viajes/iniciar */
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
        message: "Faltan datos obligatorios (id_usuario, origen_lat, origen_lng)",
      });
    }

    connection = await conectarBDMySql();
    const [result] = await connection.execute(
      `INSERT INTO viajes
      (id_pasajero, lat_desde, lon_desde, lat_hasta, lon_hasta, direccion_desde, direccion_hasta, valor, id_estado)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      [id_usuario, origen_lat, origen_lng, destino_lat, destino_lng, direccion_origen, direccion_destino, precio_estimado, 5]
    );

    const id_viaje = result.insertId;
    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viajes = ?", [id_viaje]);

    emitir(req, "viaje_creado", rows[0]);
    res.status(201).json({ result: rows[0], message: "Viaje iniciado en estado 'buscando'." });
  } catch (error) {
    console.error("❌ iniciarViaje:", error);
    res.status(500).json({ message: "Error al iniciar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/asignar */
export const asignarConductor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_conductor } = req.body;

    if (!id_conductor)
      return res.status(400).json({ message: "id_conductor es requerido" });

    connection = await conectarBDMySql();
    await connection.execute("UPDATE viajes SET id_conductor = ?, estado = 1 WHERE id_viaje = ?", [id_conductor, id]);
    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);

    emitir(req, "viaje_asignado", rows[0]);
    res.json({ result: rows[0], message: "Conductor asignado" });
  } catch (error) {
    console.error("❌ asignarConductor:", error);
    res.status(500).json({ message: "Error al asignar conductor: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/comenzar */
export const comenzarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();
    await connection.execute("UPDATE viajes SET estado = 2, fecha_inicio = NOW() WHERE id_viaje = ?", [id]);
    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);

    emitir(req, "viaje_en_curso", rows[0]);
    res.json({ result: rows[0], message: "Viaje en curso" });
  } catch (error) {
    console.error("❌ comenzarViaje:", error);
    res.status(500).json({ message: "Error al comenzar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/finalizar */
export const finalizarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { precio_final = null, distancia_km = null, duracion_min = null } = req.body;

    connection = await conectarBDMySql();
    await connection.execute(
      `UPDATE viajes
       SET estado = 4, fecha_fin = NOW(),
           precio_final = COALESCE(?, precio_final),
           distancia_km = COALESCE(?, distancia_km),
           duracion_min = COALESCE(?, duracion_min)
       WHERE id_viaje = ?`,
      [precio_final, distancia_km, duracion_min, id]
    );
    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);

    emitir(req, "viaje_finalizado", rows[0]);
    res.json({ result: rows[0], message: "Viaje finalizado" });
  } catch (error) {
    console.error("❌ finalizarViaje:", error);
    res.status(500).json({ message: "Error al finalizar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/cancelar */
export const cancelarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();
    await connection.execute("UPDATE viajes SET estado = 3 WHERE id_viaje = ?", [id]);
    const [rows] = await connection.execute("SELECT * FROM viajes WHERE id_viaje = ?", [id]);

    emitir(req, "viaje_cancelado", rows[0]);
    res.json({ result: rows[0], message: "Viaje cancelado" });
  } catch (error) {
    console.error("❌ cancelarViaje:", error);
    res.status(500).json({ message: "Error al cancelar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};
