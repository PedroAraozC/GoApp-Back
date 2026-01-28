import { conectarBDMySql } from "../config/dbMYSQL.js";

const emitir = (req, evento, data) => {
  const io = req.app.get("io");
  if (io) io.emit(evento, data);
};

/** ===========================
 *  GET /generos/obtenerGenero
 *  Devuelve todos los géneros
 * =========================== */
export const obtenerGenero = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [result] = await connection.execute("SELECT * FROM generos WHERE habilita = 1");
    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener géneros:", error);
    res.status(500).json({ message: "Error al obtener géneros." });
  } finally {
    if (connection) await connection.end();
  }
};
export const obtenerGeneroAdmin = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [result] = await connection.execute("SELECT * FROM generos ");
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
export const altaGenero = async (req, res) => {
  let connection;
  try {
    const { nombre_genero, habilita } = req.body;
    if (!nombre_genero) {
      return res
        .status(400)
        .json({ message: "El nombre del género es obligatorio." });
    }

    connection = await conectarBDMySql();
    const [result] = await connection.execute(
      "INSERT INTO generos (nombre_genero, habilita) VALUES (?, ?)",
      [nombre_genero, habilita ?? 1]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM generos WHERE id_genero = ?",
      [result.insertId]
    );

    emitir(req, "genero_actualizado", {
      accion: "alta",
      result: rows[0],
    });

    res.json({ message: "Género creado correctamente", status: "ok", result: rows[0] });
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
export const editaGenero = async (req, res) => {
  let connection;
  try {
    const { id_genero, nombre_genero, habilita } = req.body;
    if (!id_genero) {
      return res
        .status(400)
        .json({ message: "El ID del género es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "UPDATE generos SET nombre_genero = ?, habilita = ? WHERE id_genero = ?",
      [nombre_genero, habilita ?? 1, id_genero]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM generos WHERE id_genero = ?",
      [id_genero]
    );

    emitir(req, "genero_actualizado", {
      accion: "edicion",
      result: rows[0],
    });

    res.json({
      message: `Género editado correctamente`,
      status: "ok",
      result: rows[0],
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
export const eliminaGenero = async (req, res) => {
  let connection;
  try {
    const { id_genero } = req.body;
    if (!id_genero) {
      return res
        .status(400)
        .json({ message: "El ID del género es obligatorio." });
    }

    connection = await conectarBDMySql();
    await connection.execute(
      "UPDATE generos SET habilita = 0 WHERE id_genero = ?",
      [id_genero]
    );

    emitir(req, "genero_actualizado", {
      accion: "eliminacion",
      id_genero,
    });

    res.json({
      message: `Género deshabilitado correctamente`,
      status: "ok",
    });
  } catch (error) {
    console.error("❌ Error al eliminar género:", error);
    res.status(500).json({ message: "Error al eliminar género." });
  } finally {
    if (connection) await connection.end();
  }
};

export default {
  obtenerGenero,
  altaGenero,
  editaGenero,
  eliminaGenero,
};
