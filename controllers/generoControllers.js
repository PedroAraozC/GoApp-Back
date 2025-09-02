const { conectarBDMySql } = require("../config/dbMYSQL");

const obtenerGenero = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const result = await connection.execute("SELECT * FROM generos");
    res.json({ result: result[0] });
  } catch (error) {
    console.log("Hubo un error :(", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = { obtenerGenero };
