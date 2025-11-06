import { conectarBDMySql } from "../config/dbMYSQL.js";

const obtener = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [rows] = await connection.execute("SELECT * FROM pagos WHERE habilita = 1 order by nombre_pago DESC");
    res.status(200).json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener pagos: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  obtener,
};