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



const altaGenero = async (req, res) => {
  let connection;
  try {
    const { nombre_genero, habilita } = req.body;
    connection = await conectarBDMySql();
    const result = await connection.execute(
      "INSERT INTO generos (nombre_genero, habilita) values(?,?)",
      [nombre_genero, habilita]
    );

    res.json({ message: "Se creó correctamente el genero.", status: "ok" });
  } catch (error) {
    console.log("Hubo un error :(", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};


const editaGenero = async (req, res) => {
  let connection;
  try {
    const { id_genero, nombre_genero, habilita } = req.body;

    connection = await conectarBDMySql();

    const result = await connection.execute(
      "UPDATE generos SET nombre_genero = ?, habilita = ? where id_genero = ?",
      [nombre_genero, habilita, id_genero]
    );

    res.json({
      message: `Se editó correctamente el genero: ${nombre_genero}`,
      status: "ok",
    });
  } catch (error) {
    console.log("Hubo un error :(", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const eliminaGenero = async (req, res) => {
  let connection;
  try {
    const { id_genero, nombre_genero } = req.body;

    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      "UPDATE generos SET habilita = 0 WHERE id_genero = ?",
      [id_genero]
    );

    res.json({
      message: `Se actualizó correctamente el estado del género con ID: ${nombre_genero}`,
      status: "ok",
    });
  } catch (error) {
    console.error("Hubo un error :(", error);
    res.status(500).json({ message: "Error en el servidor" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = { obtenerGenero, altaGenero, editaGenero, eliminaGenero };
