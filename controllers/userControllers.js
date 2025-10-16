const bcrypt = require("bcryptjs");
const { conectarBDMySql } = require("../config/dbMYSQL");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  "125703789007-thjq5cpij6blij34sv8g404pq6ubnhjv.apps.googleusercontent.com"
);

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

const login = async (req, res) => {
  let connection;
  let { email, password } = req.body;
  try {
    connection = await conectarBDMySql();
    const result = await connection.execute(
      "SELECT * FROM usuarios WHERE email_usuario = ? AND password = ?",
      [email, password]
    );
    console.log(result[0], "Login");
    if (result[0].length > 0) res.json({ result: result[0] });
    else {
      res.json({ result: "Los datos no coinciden." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error en el login." });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const google_login = async (req, res) => {
  const { token } = req.body;
  let connection;

  if (!token) {
    return res.status(400).json({ message: "No se proporcionó el token." });
  }

  try {
    // 1. Verificar el token de identidad con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "125703789007-thjq5cpij6blij34sv8g404pq6ubnhjv.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res
        .status(400)
        .json({ message: "No se pudo obtener el email de Google." });
    }

    connection = await conectarBDMySql();
    console.log(payload, "payload");
    // 2. Buscar si el usuario ya existe en la base de datos
    const [existingUser] = await connection.execute(
      "SELECT * FROM usuarios WHERE email_usuario = ?",
      [email]
    );

    if (existingUser.length > 0) {
      // 3. Si el usuario existe, iniciar sesión y devolver sus datos
      console.log("Usuario encontrado:", existingUser[0]);
      // Aquí podrías generar un JWT para la sesión
      res.json({
        result: existingUser[0],
        message: "Inicio de sesión exitoso.",
      });
    } else {
      // 4. Si el usuario no existe, crearlo en la base de datos
      const [newUser] = await connection.execute(
        "INSERT INTO usuarios (email_usuario, nombre_usuario, foto_perfil, auth_provider) VALUES (?, ?, ?, 'google')",
        [email, name, picture]
      );

      const [createdUser] = await connection.execute(
        "SELECT * FROM usuarios WHERE id_usuario = ?",
        [newUser.insertId]
      );

      console.log("Nuevo usuario creado:", createdUser[0]);
      // Aquí también podrías generar un JWT
      res.status(201).json({
        result: createdUser[0],
        message: "Usuario registrado y sesión iniciada.",
      });
    }
  } catch (error) {
    console.error("Error en la autenticación con Google:", error);
    return res
      .status(500)
      .json({ message: "Error en la autenticación con Google." });
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
  login,
  google_login,
};
