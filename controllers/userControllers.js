const bcrypt = require("bcryptjs");
const { conectarBDMySql } = require("../config/dbMYSQL");

//FUNCION A MODO DE EJEMPLO

const obtenerUsuarios = async (req, res) => {
  let connection;

  try {
    connection = await conectarBDMySql();
    const result = await connection.execute("SELECT * FROM usuarios");
    res.json({ result: result[0] });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const obtenerUsuarioId = async (req, res) => {
  let connection;
  let { id } = req.params;
  try {
    connection = await conectarBDMySql();
    const result = await connection.execute(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    console.log(result[0], "aaaaaa");
    res.json({ result: result[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener datos del usuario" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const crearUsuario = async (req, res) => {
  let connection;

  try {
    let {
      nombre_usuario,
      apellido_usuario,
      dni,
      fecha_nacimiento,
      id_genero,
      password,
      telefono_usuario,
      email_usuario,
      id_rol,
    } = req.body;
    connection = await conectarBDMySql();

    const result = await connection.execute(
      "INSERT INTO usuarios (nombre_usuario, apellido_usuario, dni, fecha_nacimiento, id_genero, password, telefono_usuario, email_usuario, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        nombre_usuario,
        apellido_usuario,
        dni,
        fecha_nacimiento,
        id_genero,
        password,
        telefono_usuario,
        email_usuario,
        id_rol,
      ]
    );

    console.log(
      nombre_usuario,
      apellido_usuario,
      dni,
      fecha_nacimiento,
      id_genero,
      password,
      telefono_usuario,
      email_usuario,
      id_rol
    );
    res.json({
      message: "Usuario creado exitosamente",
      status: "OK",
      userId: result[0].insertId,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const actualizarUsuario = async (req, res) => {
  let connection;

  try {
    let { id } = req.params;
    let { dni, fecha_nacimiento, id_genero, telefono_usuario, email } =
      req.body;
    connection = await conectarBDMySql();
    console.log(req.params, "req params");
    console.log(req.body, "req body");
    const result = await connection.execute(
      "UPDATE usuarios SET  dni = ?, fecha_nacimiento = ?, id_genero = ?,telefono_usuario = ?, email_usuario = ? WHERE id_usuario = ?",
      [dni, fecha_nacimiento, id_genero, telefono_usuario, email, id]
    );

    res.json({ message: "Usuario actualizado exitosamente", status: "OK" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar usuario. Error: " + error.message,
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const eliminarUsuario = async (req, res) => {
  let connection;

  try { 
    const { id } = req.params;
    connection = await conectarBDMySql();

    const result = await connection.execute(
      "UPDATE usuarios SET habilita = 0 WHERE id_usuario = ?",
      [id]
    );

    res.json({ message: "Usuario eliminado exitosamente", status: "OK" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar el usuario. Error: " + error.message,
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
