import { conectarBDMySql } from "../config/dbMYSQL.js";

export const obtenerEstado = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      `SELECT * from estado_validacion WHERE habilita = 1`
    );
    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener estados:", error);
    res.status(500).json({ message: "Error al obtener estados." });
  } finally {
    if (connection) await connection.end();
  }
};

export const cambiarEstadoSolicitud = async (req, res) => {
  let connection;
  try {
    const { id_validacion, id_estado_validacion, observaciones } = req.body;
    console.log("pingoo")
    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      `UPDATE validacion_conductor set id_estado_validacion = ?, observaciones = ? WHERE id_validacion = ?`,
      [id_estado_validacion, observaciones, id_validacion]
    );
    console.log(result);
    res.json({ result, status: "OK" });
  } catch (error) {
    console.error("❌ Error al cambiar estado de solicitud:", error);
    res.status(500).json({ message: "Error al cambiar estado de solicitud." });
  } finally {
    if (connection) await connection.end();
  }
};