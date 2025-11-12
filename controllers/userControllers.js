import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { conectarBDMySql } from "../config/dbMYSQL.js";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const client = new OAuth2Client(process.env.SERVER_CLIENT_ID);

const emitir = (req, evento, data) => {
  const io = req.app.get("io");
  if (io) io.emit(evento, data);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL,
  },
});

const codigosVerificacion = {};

/* ==========================================
   🔹 Recuperar contraseña y validación
   ========================================== */
const verificarUsuario = async (req, res) => {
  let connection;
  const { dni, email } = req.body;

  try {
    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      "SELECT * FROM usuarios WHERE dni = ? AND email_usuario = ?",
      [dni, email]
    );

    if (rows.length === 0)
      return res.status(400).json({
        success: false,
        message: "DNI y correo no coinciden",
      });

    const codigo = Math.floor(10000 + Math.random() * 90000);
    codigosVerificacion[email] = codigo;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding:20px;">
        <table width="100%" style="max-width:600px; margin:auto; background:white; border-radius:6px;">
          <tr><td style="background-color:#ddc701; color:white; text-align:center; padding:15px 0;">
            <h2 style="margin:0;">TUCU TAXI</h2>
          </td></tr>
          <tr><td style="padding:25px;">
            <p>Estimado/a <b>${rows[0].apellido_usuario}, ${rows[0].nombre_usuario}</b>,</p>
            <p>Su código de verificación es:</p>
            <div style="text-align:center; margin:20px 0;">
              <div style="background:#ddc701;color:white;font-size:24px;padding:10px 30px;border-radius:8px;">${codigo}</div>
            </div>
          </td></tr>
        </table>
      </div>`;

    await transporter.sendMail({
      from: "Tucu Taxi <avisos@tucutaxi.com>",
      to: email,
      subject: "Código de recuperación",
      html: htmlBody,
    });
    res.json({ success: true, message: "Código enviado al correo" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error,
    });
  } finally {
    if (connection) await connection.end();
  }
};

const validarCodigo = (req, res) => {
  const { email, codigo } = req.body;
  if (codigosVerificacion[email] && codigosVerificacion[email] == codigo) {
    delete codigosVerificacion[email];
    return res.json({ success: true, message: "Código verificado" });
  }
  return res
    .status(400)
    .json({ success: false, message: "Código inválido o expirado" });
};

const changePassword = async (req, res) => {
  let connection;
  const { email, actual, nueva } = req.body;

  try {
    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      "SELECT * FROM usuarios WHERE email_usuario = ?",
      [email]
    );

    if (rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Usuario no encontrado" });

    const user = rows[0];
    if (user.password !== actual)
      return res
        .status(400)
        .json({ success: false, message: "Contraseña actual incorrecta" });

    await connection.execute(
      "UPDATE usuarios SET password = ? WHERE email_usuario = ?",
      [nueva, email]
    );

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar contraseña",
    });
  } finally {
    if (connection) await connection.end();
  }
};

/* ==========================================
   🔹 CRUD de Usuarios + Login
   ========================================== */

const obtenerUsuarios = async (req, res) => {
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
    res.status(500).json({ message: "Error al obtener usuarios: " + error });
  } finally {
    if (connection) await connection.end();
  }
};

const obtenerUsuarioId = async (req, res) => {
  let connection;
  const { id } = req.params;
  try {
    console.log("aaaaaaaaa");
    connection = await conectarBDMySql();
    const [rows] = await connection.execute(
      `SELECT 
      u.*, 
      g.nombre_genero
   FROM usuarios u
   LEFT JOIN generos g ON u.id_genero = g.id_genero
   WHERE u.id_usuario = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const usuario = rows[0];
    if (!usuario.fecha_nacimiento || usuario.fecha_nacimiento === "0000-00-00")
      usuario.fecha_nacimiento = null;
    else if (
      !usuario.fecha_nacimiento ||
      usuario.fecha_nacimiento === "0000-00-00"
    ) {
      usuario.fecha_nacimiento = null;
    } else {
      const fecha = new Date(usuario.fecha_nacimiento);
      const dia = String(fecha.getDate()).padStart(2, "0");
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const anio = fecha.getFullYear();
      usuario.fecha_nacimiento = `${dia}/${mes}/${anio}`;
    }

    res.json({ result: usuario });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario: " + error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

const crearUsuario = async (req, res) => {
  let connection;
  const io = req.app.get("io"); // ✅ Socket

  const { apellido, nombre, password, email } = req.body;
  try {
    connection = await conectarBDMySql();
    const [existe] = await connection.execute(
      "SELECT * FROM usuarios WHERE email_usuario = ?",
      [email]
    );
    if (existe.length > 0)
      return res.status(400).json({ message: "El email ya está registrado." });

    const [result] = await connection.execute(
      `INSERT INTO usuarios (nombre_usuario, apellido_usuario, password, email_usuario, id_rol, auth_provider)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, password, email, 1, "manual"]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id_usuario: userId, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔊 Emitir nuevo usuario
    io.emit("usuario_creado", { id_usuario: userId, nombre, apellido, email });

    res.status(200).json({
      message: "Usuario creado exitosamente",
      status: "OK",
      userId,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// const actualizarUsuario = async (req, res) => {
//   let connection;
//   const io = req.app.get("io");
//   const { id } = req.params;
//   let { dni, fecha_nacimiento, id_genero, telefono_usuario, email, email_usuario } = req.body;

//   try {
//     connection = await conectarBDMySql();
//     const correo = email || email_usuario;

//     if (fecha_nacimiento) {
//       if (fecha_nacimiento.includes("/")) {
//         const [dia, mes, anio] = fecha_nacimiento.split("/");
//         fecha_nacimiento = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
//       } else if (fecha_nacimiento.includes("T") || fecha_nacimiento.includes(" ")) {
//         fecha_nacimiento = fecha_nacimiento.split(/[T ]/)[0];
//       }
//     } else fecha_nacimiento = null;

//     await connection.execute(
//       `UPDATE usuarios
//        SET dni = ?, fecha_nacimiento = ?, id_genero = ?, telefono_usuario = ?, email_usuario = ?
//        WHERE id_usuario = ?`,
//       [dni, fecha_nacimiento, id_genero, telefono_usuario, correo, id]
//     );

//     io.emit("usuario_actualizado", { id_usuario: id });

//     res.json({ message: "Usuario actualizado exitosamente", status: "OK" });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error al actualizar usuario: " + error.message,
//     });
//   } finally {
//     if (connection) await connection.end();
//   }
// };

const eliminarUsuario = async (req, res) => {
  let connection;
  const io = req.app.get("io");
  try {
    const { id } = req.params;
    connection = await conectarBDMySql();
    await connection.execute(
      "UPDATE usuarios SET habilita = 0 WHERE id_usuario = ?",
      [id]
    );

    io.emit("usuario_eliminado", { id_usuario: id });

    res.json({ message: "Usuario eliminado exitosamente", status: "OK" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar usuario: " + error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

/* ==========================================
   🔹 Login clásico y Google
   ========================================== */
const login = async (req, res) => {
  let connection;
  const io = req.app.get("io");
  const { email, password } = req.body;

  try {
    connection = await conectarBDMySql();
    const [rows] = await connection.execute(
      "SELECT * FROM usuarios WHERE email_usuario = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado." });

    const user = rows[0];
    if (password != user.password)
      return res.status(401).json({ message: "Contraseña incorrecta." });

    const token = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    io.emit("usuario_login", { id_usuario: user.id_usuario });

    res.json({
      result: user,
      token,
      message: "Inicio de sesión exitoso.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login." });
  } finally {
    if (connection) await connection.end();
  }
};

const google_login = async (req, res) => {
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
    const { sub: google_id, email, given_name, family_name, picture } = payload;

    connection = await conectarBDMySql();

    const [existingUser] = await connection.execute(
      "SELECT * FROM usuarios WHERE email_usuario = ? OR google_id = ?",
      [email, google_id]
    );

    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];
    } else {
      const [result] = await connection.execute(
        "INSERT INTO usuarios (nombre_usuario, apellido_usuario, email_usuario, google_id, foto_perfil, auth_provider) VALUES (?, ?, ?, ?, ?, ?)",
        [given_name, family_name, email, google_id, picture, "google"]
      );
      const [newUser] = await connection.execute(
        "SELECT * FROM usuarios WHERE id_usuario = ?",
        [result.insertId]
      );
      user = newUser[0];

      io.emit("usuario_creado", user);
    }

    const tokenJWT = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
    if (connection) await connection.end();
  }
};

const actualizarUsuario = async (req, res) => {
  let connection;
  const { id } = req.params;
  let {
    dni,
    fecha_nacimiento,
    id_genero,
    telefono_usuario,
    email_usuario,
    email,
  } = req.body;

  try {
    connection = await conectarBDMySql();
    const correo = email || email_usuario;
    if (fecha_nacimiento) {
      const partes = fecha_nacimiento.split("/");
      fecha_nacimiento = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    console.log(req.body);
    await connection.execute(
      `UPDATE usuarios SET dni=?, fecha_nacimiento=?, id_genero=?, telefono_usuario=?, email_usuario=? WHERE id_usuario=?`,
      [dni, fecha_nacimiento, id_genero, telefono_usuario, correo, id]
    );

    const [rows] = await connection.execute(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    emitir(req, "usuario_actualizado", rows[0]);
    res.json({ message: "Usuario actualizado", result: rows[0] });
  } catch (error) {
    console.error("❌ actualizarUsuario:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar usuario: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};
const editarRolUsuario = async (req, res) => {
  let connection;
  try {
    const { id_usuario, id_rol } = req.body;

    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      `UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?`,
      [id_rol, id_usuario]
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

export {
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  login,
  google_login,
  verificarUsuario,
  validarCodigo,
  changePassword,
  editarRolUsuario,
};
