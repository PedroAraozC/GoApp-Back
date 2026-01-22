const { conectarBDMySql } = require("../config/dbMYSQL");


/* C R U D */

/* Create */
const altaRol = async (req, res) => {
  let connection;
  try {
    const { nombre_rol, habilita } = req.body;
    if (!nombre_rol) {
      return res
        .status(400)
        .json({ message: "El nombre del rol es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "INSERT INTO roles (nombre_rol, habilita) VALUES (?, ?)",
      [nombre_rol, habilita ?? 1]
    );

    // 🔊 Emitir evento Socket.IO
    const io = req.app.get("io");
    io.emit("rol_actualizado", {
      accion: "alta",
      nombre_rol,
      habilita,
    });

    res.json({ message: "Se creó correctamente el rol.", status: "ok" });
  } catch (error) {
    console.error("❌ Error al crear rol:", error);
    res.status(500).json({ message: "Error al crear rol." });
  } finally {
    if (connection) await connection.end();
  }
};

/* ================================
   🔹 READ - GET /roles/obtenerRol
   ================================ */
const obtenerRol = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [result] = await connection.execute("SELECT * FROM roles");
    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({ message: "Error al obtener roles." });
  } finally {
    if (connection) await connection.end();
  }
};

/* ================================
   🔹 UPDATE - PUT /roles/editaRol
   ================================ */
const editaRol = async (req, res) => {
  let connection;
  try {
    const { id_rol, nombre_rol, habilita } = req.body;
    if (!id_rol) {
      return res.status(400).json({ message: "El ID del rol es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "UPDATE roles SET nombre_rol = ?, habilita = ? WHERE id_rol = ?",
      [nombre_rol, habilita, id_rol]
    );

    // 🔊 Emitir evento Socket.IO
    const io = req.app.get("io");
    io.emit("rol_actualizado", {
      accion: "edicion",
      id_rol,
      nombre_rol,
      habilita,
    });

    res.json({
      message: `Se editó correctamente el rol: ${nombre_rol}`,
      status: "ok",
    });
  } catch (error) {
    console.error("❌ Error al editar rol:", error);
    res.status(500).json({ message: "Error al editar rol." });
  } finally {
    if (connection) await connection.end();
  }
};

/* ================================
   🔹 DELETE - PUT /roles/eliminarRol
   ================================ */
const eliminarRol = async (req, res) => {
  let connection;
  try {
    const { id_rol, nombre_rol } = req.body;
    if (!id_rol) {
      return res.status(400).json({ message: "El ID del rol es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute("UPDATE roles SET habilita = 0 WHERE id_rol = ?", [
      id_rol,
    ]);

    // 🔊 Emitir evento Socket.IO
    const io = req.app.get("io");
    io.emit("rol_actualizado", {
      accion: "eliminacion",
      id_rol,
      nombre_rol,
    });

    res.json({
      message: `Se deshabilitó correctamente el rol con ID: ${id_rol}`,
      status: "ok",
    });
  } catch (error) {
    console.error("❌ Error al eliminar rol:", error);
    res.status(500).json({ message: "Error al eliminar rol." });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = { altaRol, obtenerRol, editaRol, eliminarRol };