import { conectarBDMySql } from "../config/dbMYSQL.js";

/** ===========================
 *  GET /generos/obtenerGenero
 *  Devuelve todos los géneros
 * =========================== */
const obtenerGenero = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [result] = await connection.execute("SELECT * FROM generos");
    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener géneros:", error);
    res.status(500).json({ message: "Error al obtener géneros." });
  } finally {
    if (connection) await connection.end();
  }
};

/** ===========================
 *  POST /generos/altaGenero
 *  Crea un nuevo género
 * =========================== */
const altaGenero = async (req, res) => {
  let connection;
  try {
    const { nombre_genero, habilita } = req.body;
    if (!nombre_genero) {
      return res.status(400).json({ message: "El nombre del género es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "INSERT INTO generos (nombre_genero, habilita) VALUES (?, ?)",
      [nombre_genero, habilita ?? 1]
    );

    // 🔊 Emitimos el evento a todos los clientes conectados
    const io = req.app.get("io");
    io.emit("genero_actualizado", {
      accion: "alta",
      nombre_genero,
      habilita,
    });

    res.json({ message: "Se creó correctamente el género.", status: "ok" });
  } catch (error) {
    console.error("❌ Error al crear género:", error);
    res.status(500).json({ message: "Error al crear género." });
  } finally {
    if (connection) await connection.end();
  }
};

/** ===========================
 *  PUT /generos/editaGenero
 *  Actualiza un género existente
 * =========================== */
const editaGenero = async (req, res) => {
  let connection;
  try {
    const { id_genero, nombre_genero, habilita } = req.body;
    if (!id_genero) {
      return res.status(400).json({ message: "El ID del género es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "UPDATE generos SET nombre_genero = ?, habilita = ? WHERE id_genero = ?",
      [nombre_genero, habilita, id_genero]
    );

    // 🔊 Emitimos el evento de actualización
    const io = req.app.get("io");
    io.emit("genero_actualizado", {
      accion: "edicion",
      id_genero,
      nombre_genero,
      habilita,
    });

    res.json({
      message: `Se editó correctamente el género: ${nombre_genero}`,
      status: "ok",
    });
  } catch (error) {
    console.error("❌ Error al editar género:", error);
    res.status(500).json({ message: "Error al editar género." });
  } finally {
    if (connection) await connection.end();
  }
};

/** ===========================
 *  PUT /generos/eliminaGenero
 *  Deshabilita un género
 * =========================== */
const eliminaGenero = async (req, res) => {
  let connection;
  try {
    const { id_genero, nombre_genero } = req.body;
    if (!id_genero) {
      return res.status(400).json({ message: "El ID del género es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "UPDATE generos SET habilita = 0 WHERE id_genero = ?",
      [id_genero]
    );

    // 🔊 Emitimos el evento de eliminación
    const io = req.app.get("io");
    io.emit("genero_actualizado", {
      accion: "eliminacion",
      id_genero,
      nombre_genero,
    });

    res.json({
      message: `Se deshabilitó correctamente el género con ID: ${id_genero}`,
      status: "ok",
    });
  } catch (error) {
    console.error("❌ Error al eliminar género:", error);
    res.status(500).json({ message: "Error al eliminar género." });
  } finally {
    if (connection) await connection.end();
  }
};

export { obtenerGenero, altaGenero, editaGenero, eliminaGenero };
