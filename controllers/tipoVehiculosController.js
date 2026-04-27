import {conectarBDMySql} from "../config/dbMYSQL.js";

/* C R U D */

/* Create */
export const altaTipoVehiculo = async (req, res) => {
  let connection;
  try {
    const { nombre_tipo_vehiculo, habilita } = req.body;
    if (!nombre_tipo_vehiculo) {
      return res
        .status(400)
        .json({ message: "El nombre del tipo de vehículo es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "INSERT INTO tipos_vehculo (nombre_tipo_vehiculo, habilita) VALUES (?, ?)",
      [nombre_tipo_vehiculo, habilita ?? 1],
    );

    // 🔊 Emitir evento Socket.IO
    const io = req.app.get("io");
    io.emit("tipo_vehiculo_actualizado", {
      accion: "alta",
      nombre_tipo_vehiculo,
      habilita,
    });

    res.json({ message: "Se creó correctamente el tipo de vehículo.", status: "ok" });
  } catch (error) {
    console.error("❌ Error al crear tipo de vehículo:", error);
    res.status(500).json({ message: "Error al crear tipo de vehículo." });
  } finally {
    if (connection) await connection.end();
  }
};

/* ================================
   🔹 READ - GET /roles/obtenerRol
   ================================ */
export const obtenerTipoVehiculo = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [result] = await connection.execute(
      "SELECT * FROM tipos_vehiculo WHERE habilita = 1",
    );
    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener tipos de vehículo:", error);
    res.status(500).json({ message: "Error al obtener tipos de vehículo." });
  } finally {
    if (connection) await connection.end();
  }
};
export const obtenerTipoVehiculoAdmin = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [result] = await connection.execute("SELECT * FROM tipos_vehiculo");
    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener tipos de vehículo:", error);
    res.status(500).json({ message: "Error al obtener tipos de vehículo." });
  } finally {
    if (connection) await connection.end();
  }
};

/* ================================
   🔹 UPDATE - PUT /roles/editaRol
   ================================ */
export const editaTipoVehiculo = async (req, res) => {
  let connection;
  try {
    const { id_tipo_vehiculo, nombre_tipo_vehiculo, habilita } = req.body;
    if (!id_tipo_vehiculo) {
      return res.status(400).json({ message: "El ID del tipo de vehículo es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "UPDATE tipos_vehiculo SET nombre_tipo_vehiculo = ?, habilita = ? WHERE id_tipo_vehiculo = ?",
      [nombre_tipo_vehiculo, habilita, id_tipo_vehiculo],
    );

    // 🔊 Emitir evento Socket.IO
    const io = req.app.get("io");
    io.emit("tipo_vehiculo_actualizado", {
      accion: "edicion",
      id_tipo_vehiculo,
      nombre_tipo_vehiculo,
      habilita,
    });

    res.json({
      message: `Se editó correctamente el tipo de vehículo: ${nombre_tipo_vehiculo}`,
      status: "ok",
    });
  } catch (error) {
    console.error("❌ Error al editar tipo de vehículo:", error);
    res.status(500).json({ message: "Error al editar tipo de vehículo." });
  } finally {
    if (connection) await connection.end();
  }
};

/* ================================
   🔹 DELETE - PUT /roles/eliminarRol
   ================================ */
export const eliminarTipoVehiculo = async (req, res) => {
  let connection;
  try {
    const { id_tipo_vehiculo, nombre_tipo_vehiculo } = req.body;
    if (!id_tipo_vehiculo) {
      return res.status(400).json({ message: "El ID del tipo de vehículo es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute("UPDATE tipos_vehiculo SET habilita = 0 WHERE id_tipo_vehiculo = ?", [
      id_tipo_vehiculo,
    ]);

    // 🔊 Emitir evento Socket.IO
    const io = req.app.get("io");
    io.emit("tipo_vehiculo_actualizado", {
      accion: "eliminacion",
      id_tipo_vehiculo,
      nombre_tipo_vehiculo,
    });

    res.json({
      message: `Se deshabilitó correctamente el tipo de vehículo con ID: ${id_tipo_vehiculo}`,
      status: "ok",
    });
  } catch (error) {
    console.error("❌ Error al eliminar tipo de vehículo:", error);
    res.status(500).json({ message: "Error al eliminar tipo de vehículo." });
  } finally {
    if (connection) await connection.end();
  }
};
