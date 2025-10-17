import {conectarBDMySql}  from "../config/dbMYSQL.js";


/* C R U D */

/* Create */
const altaRol = async (req, res) => {
  let connection;
  try {
    const { nombre_rol, habilita } = req.body;
    connection = await conectarBDMySql();
    const result = await connection.execute(
      "INSERT INTO roles (nombre_rol, habilita) values(?,?)",
      [nombre_rol, habilita]
    );

    res.json({ message: "Se creó correctamente el rol.", status: "ok" });
  } catch (error) {
    console.log("Hubo un error. Todo explotará", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/* Read */

const obtenerRol = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const result = await connection.execute("SELECT * FROM roles");
    res.json({ result: result[0] });
  } catch (error) {
    console.log("Hubo un error. Todo explotará", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/* Update */

const editaRol = async (req, res) => {
  let connection;
  try {
    const { id_rol, nombre_rol, habilita } = req.body;

    connection = await conectarBDMySql();

    const result = await connection.execute(
      "UPDATE roles SET nombre_rol = ?, habilita = ? where id_rol = ?",
      [nombre_rol, habilita, id_rol]
    );

    res.json({
      message: `Se editó correctamente el rol: ${nombre_rol}`,
      status: "ok",
    });
  } catch (error) {
    console.log("Hubo un error, todo explotará", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};


/* Delete */

const eliminarRol = async (req, res) => {
  let connection;
  try {
    const { id_rol, nombre_rol } = req.body;

    connection = await conectarBDMySql();

    const result = await connection.execute(
      "UPDATE roles SET habilita = 0 where id_rol = ?",
      [id_rol]
    );

    res.json({
      message: `Se editó correctamente el rol: ${nombre_rol}`,
      status: "ok",
    });
  } catch (error) {
    console.log("Hubo un error, todo explotará", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export { altaRol, obtenerRol, editaRol, eliminarRol };