import { conectarBDMySql } from "../config/dbMYSQL.js";

export const obtenerConductores = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();

    const [result] = await connection.execute(`
      SELECT 
        c.id_usuario,
        u.nombre_usuario,
        u.apellido_usuario,
        v.fecha_validacion,
        v.observaciones,
        c.matricula,
        c.id_conductor,
        c.nro_motor,
        c.licencia,
        c.vencimiento_licencia,
        c.seguro,
        c.id_estado_validacion
      FROM conductores c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN validacion_conductor v ON c.id_usuario = v.id_usuario
    `);

    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener conductores:", error);
    res.status(500).json({ message: "Error al obtener conductores." });
  } finally {
    if (connection) await connection.end();
  }
};
