import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { conectarBDMySql } from "../config/dbMYSQL.js";
import { auth, OAuth2Client } from "google-auth-library";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OAuth2Client(
  "125703789007-thjq5cpij6blij34sv8g404pq6ubnhjv.apps.googleusercontent.com",
);

export const obtenerUsuarios = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [result] = await connection.execute(`
  SELECT 
    u.*, 
    r.nombre_rol, 
    g.nombre_genero
  FROM usuarios u
  LEFT JOIN roles r ON u.id_rol = r.id_rol
  LEFT JOIN generos g ON u.id_genero = g.id_genero
`);

    res.json({ result });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios" });
  } finally {
    if (connection) await connection.end();
  }
};

export const obtenerUsuarioId = async (req, res) => {
  let connection;
  let { id } = req.params;
  try {
    console.log(id);
    connection = await conectarBDMySql();
    const result = await connection.execute(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id],
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

/* ==========================================
   🔹 Login clásico y Google
   ========================================== */
export const login = async (req, res) => {
  let connection;
  let { email, password } = req.body;
  console.log(req.body);
  try {
    connection = await conectarBDMySql();
    const [rows] = await connection.execute(
      "SELECT u.*, g.nombre_genero, r.nombre_rol FROM usuarios u LEFT JOIN generos g ON u.id_genero = g.id_genero LEFT JOIN roles r ON u.id_rol = r.id_rol WHERE u.email_usuario = ?",
      [email],
    );

    // console.log(rows);
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado." });

    const user = rows[0];
    const validPassword = password === user.password;
    // const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Contraseña incorrecta." });

    console.log(password == user.password);
    const token = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const usuarioSeguro = {
      id_usuario: user.id_usuario,
      nombre_usuario: user.nombre_usuario,
      apellido_usuario: user.apellido_usuario,
      email_usuario: user.email_usuario,
      dni: user.dni,
      fecha_nacimiento: user.fecha_nacimiento,
      telefono: user.telefono_usuario,
      id_genero: user.id_genero,
      nombre_genero: user.nombre_genero,
      id_rol: user.id_rol,
      nombre_rol: user.nombre_rol,
      foto_perfil: user.foto_perfil,
      auth_prvider: user.auth_prvider,
      estado: user.estado,
      habilita: user.habilita,
    };

    console.log(user, "Login");
    res.json({
      result: usuarioSeguro,
      token,
      message: "Inicio de sesión exitoso.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login." });
  } finally {
    if (connection) await connection.end();
  }
};

export const google_login = async (req, res) => {
  const { token } = req.body;
  const io = req.app.get("io");
  let connection;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "125703789007-m6785nj61t63qvdjkok8qokrd9tsdoog.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture } = payload;
    console.log(payload);
    if (!email) {
      return res
        .status(400)
        .json({ message: "No se pudo obtener el email de Google." });
    }

    connection = await conectarBDMySql();
    console.log(email);
    const [existingUser] = await connection.execute(
      "SELECT * FROM usuarios WHERE email_usuario = ? OR google_id = ?",
      [email, google_id],
    );

    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];
    } else {
      const [result] = await connection.execute(
        "INSERT INTO usuarios (nombre_usuario, email_usuario, google_id, foto_perfil, auth_prvider) VALUES (?, ?, ?, ?, ?)",
        [name, email, google_id, picture, "google"],
      );
      const [newUser] = await connection.execute(
        "SELECT * FROM usuarios WHERE id_usuario = ?",
        [result.insertId],
      );
      user = newUser[0];

      io.emit("usuario_creado", user);
    }

    const tokenJWT = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    io.emit("usuario_login", { id_usuario: user.id_usuario });

    res.status(201).json({
      result: user,
      token: tokenJWT,
      message: "Inicio de sesión con Google exitoso.",
    });
  } catch (error) {
    console.error("Error en Google Login:", error);
    res.status(500).json({ message: "Error en la autenticación con Google." });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const crearUsuario = async (req, res) => {
  let connection;

  try {
    const {
      nombre_usuario,
      apellido_usuario,
      dni,
      fecha_nacimiento,
      id_genero,
      telefono_usuario,
      email_usuario,
      password,
      id_rol,
    } = req.body;

    connection = await conectarBDMySql();

    // validaciones básicas
    const [existeEmail] = await connection.execute(
      "SELECT 1 FROM usuarios WHERE email_usuario = ?",
      [email_usuario],
    );
    const [existeDNI] = await connection.execute(
      "SELECT 1 FROM usuarios WHERE dni = ?",
      [dni],
    );
    if (existeEmail.length)
      return res.status(400).json({ message: "Email ya registrado" });
    if (existeDNI.length)
      return res.status(400).json({ message: "DNI ya registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.execute(
      `INSERT INTO usuarios
       (nombre_usuario, apellido_usuario, dni, fecha_nacimiento, id_genero,
        telefono_usuario, email_usuario, password, id_rol, estado, habilita)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', 1)`,
      [
        nombre_usuario,
        apellido_usuario,
        dni,
        fecha_nacimiento,
        id_genero,
        telefono_usuario,
        email_usuario,
        hashedPassword,
        id_rol,
      ],
    );

    res.json({
      message: "Usuario creado correctamente",
      id_usuario: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

export const actualizarUsuario = async (req, res) => {
  let connection;

  try {
    let { id } = req.params;

    // 👇 alineamos nombres con lo que viene desde Flutter
    let { dni, fecha_nacimiento, id_genero, telefono_usuario, email_usuario } =
      req.body;

    connection = await conectarBDMySql();
    console.log("req params", req.params);
    console.log("req body", req.body);

    const [result] = await connection.execute(
      `UPDATE usuarios 
       SET dni = ?, 
           fecha_nacimiento = ?, 
           id_genero = ?, 
           telefono_usuario = ?, 
           email_usuario = ?
       WHERE id_usuario = ?`,
      [dni, fecha_nacimiento, id_genero, telefono_usuario, email_usuario, id],
    );

    console.log("UPDATE usuarios result:", result);

    res.json({
      message: "Usuario actualizado exitosamente",
      status: "OK",
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    return res.status(500).json({
      message: "Error al actualizar usuario. Error: " + error.message,
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const eliminarUsuario = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    connection = await conectarBDMySql();

    const result = await connection.execute(
      "UPDATE usuarios SET habilita = 0 WHERE id_usuario = ?",
      [id],
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
export const editarRolUsuario = async (req, res) => {
  let connection;
  try {
    const { id_usuario, id_rol } = req.body;

    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      `UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?`,
      [id_rol, id_usuario],
    );

    res.status(200).json({
      message: "Rol modificado exitosamente.",
      status: "OK",
    });
  } catch (error) {
    console.error("❌ Cambiar Rol de usuario:", error);
    res.status(500).json({
      message: "Error al cambiar el rol del usuario: " + error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

// DELETE /usuarios/rollback/:id_usuario
export const rollbackUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  let connection;

  try {
    connection = await conectarBDMySql();
    await connection.beginTransaction();

    // eliminar imágenes (si existen)
    const basePath = path.join(
      __dirname,
      "../../uploads/usuarios",
      String(id_usuario),
    );

    if (fs.existsSync(basePath)) {
      fs.rmSync(basePath, { recursive: true, force: true });
    }

    // eliminar conductor
    await connection.execute("DELETE FROM conductores WHERE id_usuario = ?", [
      id_usuario,
    ]);

    // eliminar usuario
    await connection.execute("DELETE FROM usuarios WHERE id_usuario = ?", [
      id_usuario,
    ]);

    await connection.commit();

    res.json({ message: "Rollback realizado correctamente" });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};
// PUT /usuarios/confirmar/:id_usuario
// controllers/userControllers.js
export const confirmarUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  let connection;

  try {
    connection = await conectarBDMySql();

    await connection.execute(
      `UPDATE usuarios 
       SET estado = 'activo' 
       WHERE id_usuario = ? AND estado = 'pendiente'`,
      [id_usuario],
    );

    res.json({ message: "Usuario confirmado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};
