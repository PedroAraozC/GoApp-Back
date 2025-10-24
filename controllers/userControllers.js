import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { conectarBDMySql } from "../config/dbMYSQL.js";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";

const client = new OAuth2Client(
    "125703789007-thjq5cpij6blij34sv8g404pq6ubnhjv.apps.googleusercontent.com"
);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tucutaxiok@gmail.com',
        pass: 'snzu bwcd gkyg orlo'
    }
});

const codigosVerificacion = {};

const verificarUsuario = async (req, res) => {
    let connection;
    const { dni, email } = req.body;

    try {
        connection = await conectarBDMySql();

        const [rows] = await connection.execute(
            "SELECT * FROM usuarios WHERE dni = ? AND email_usuario = ?",
            [dni, email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'DNI y correo no coinciden' });
        }

        // Generar código aleatorio de 5 dígitos
        const codigo = Math.floor(10000 + Math.random() * 90000);
        codigosVerificacion[email] = codigo;

        const htmlBody = `
        <div
            style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding:20px;">
            <table width="100%"
                style="max-width:600px; margin:auto; background:white; border-radius:6px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
                <tr>
                    <td
                        style="background-color:#ddc701; color:white; text-align:center; padding:15px 0;">
                        <h2 style="margin:0;">TUCU TAXI</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding:25px;">
                        <p>Estimado/a <b>${rows[0].apellido_usuario}, ${rows[0].nombre_usuario}</b>,</p>
                        <p>Le enviamos el siguiente código de seguridad para
                            continuar con la recuperación de su usuario y clave:</p>
                        <div style="text-align:center; margin:25px 0;">
                            <div
                                style="display:inline-block; background-color:#ddc701; color:white; font-size:24px; font-weight:bold; padding:15px 30px; border-radius:8px;">
                                ${codigo}
                            </div>
                        </div>
                        <p>Recuerde que la información enviada es personal y
                            privada.</p>

                        <hr
                            style="border:none; border-top:1px solid #ddd; margin:30px 0;">

                        <p style="font-size:12px; color:#555; line-height:1.5;">
                            Este mensaje fue originado automáticamente. Por
                            favor, no responda al mismo.<br><br>
                            Tucu Taxi, a los efectos de resguardar su seguridad, no
                            tiene prácticas de solicitar ningún tipo de
                            información por e-mail.
                            Si recibe un llamado o correo solicitando
                            información personal, no lo responda ni ingrese
                            datos personales ni claves.<br><br>
                            Ante cualquier consulta, escríbanos a
                            <a href="mailto:tucutaxiok@gmail.com"
                                style="color:#003087;">delitosinformaticos-arg@tucutaxi.com</a>
                            o contáctese al <b>0800-123-4567</b>.<br><br>
                            El contenido de este mensaje es privado,
                            confidencial y exclusivo para sus destinatarios.
                            Tucu Taxi no se responsabiliza por
                            los daños derivados del incumplimiento de lo aquí
                            establecido.
                        </p>
                    </td>
                </tr>
            </table>
        </div>
        `

        // Enviar email
        await transporter.sendMail({
            from: 'Tucu Taxi <avisos@tucutaxi.com',
            to: email,
            subject: 'Aviso de CÓDIGO DE SEGURIDAD',
            html: htmlBody,
        });

        res.json({ success: true, message: 'Código enviado al correo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor' + error });
    }
}

const validarCodigo = (req, res) => {
    const { email, codigo } = req.body;

    if (codigosVerificacion[email] && codigosVerificacion[email] == codigo) {
        delete codigosVerificacion[email];
        return res.json({ success: true, message: 'Código verificado' });
    } else {
        return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
    }
}

const changePassword = async (req, res) => {
    let connection;
    const { email, actual, nueva } = req.body;

    try {
        connection = await conectarBDMySql();
        const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email_usuario = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
        }

        const user = rows[0];

        if (user.password !== actual) {
            return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        await connection.execute('UPDATE usuarios SET password = ? WHERE email_usuario = ?', [nueva, email]);
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar contraseña' });
    }
}

const obtenerUsuarios = async (req, res) => {
    let connection;

    try {
        connection = await conectarBDMySql();
        const result = await connection.execute("SELECT * FROM usuarios");
        res.json({ result: result[0] });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener usuarios. Error: " + error });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

const obtenerUsuarioId = async (req, res) => {
    let connection;
    const { id } = req.params;

    try {
        connection = await conectarBDMySql();

        // Ejecutar la consulta
        const [rows] = await connection.execute(
            "SELECT * FROM usuarios WHERE id_usuario = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const usuario = rows[0];

        // Formatear fecha_nacimiento: si existe, mantener YYYY-MM-DD; si es '0000-00-00' o null, poner null
        if (!usuario.fecha_nacimiento || usuario.fecha_nacimiento === '0000-00-00') {
            usuario.fecha_nacimiento = null;
        } else {
            // Opcional: asegurarse que venga en formato 'YYYY-MM-DD'
            usuario.fecha_nacimiento = usuario.fecha_nacimiento.toString().split('T')[0];
        }

        // Enviar usuario al frontend
        res.json({ result: usuario });
    } catch (error) {
        console.error("❌ Error en obtenerUsuarioId:", error);
        res.status(500).json({ message: "Error al obtener datos del usuario: " + error.message });
    } finally {
        if (connection) await connection.end();
    }
};



const login = async (req, res) => {
    let connection;
    let { email, password } = req.body;

    try {
        connection = await conectarBDMySql();

        const [rows] = await connection.execute(
            "SELECT * FROM usuarios WHERE email_usuario = ?",
            [email]
        );

        if (rows.length === 0)
            return res.status(404).json({ message: "Usuario no encontrado." });

        const user = rows[0];

        /*const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(401).json({ message: "Contraseña incorrecta." });
        */
        if (password != user.password)
            return res.status(401).json({ message: "Contraseña incorrecta." });

        const token = jwt.sign(
            { id_usuario: user.id_usuario, email: user.email_usuario },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            result: user,
            token,
            message: "Inicio de sesión exitoso.",
        });
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
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience:
                "125703789007-m6785nj61t63qvdjkok8qokrd9tsdoog.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const { sub: google_id, email, given_name, family_name, picture } = payload;

        if (!email) {
            return res
                .status(400)
                .json({ message: "No se pudo obtener el email de Google." });
        }

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
                [given_name, family_name, email, google_id, picture, 'google']
            );

            const [newUser] = await connection.execute(
                "SELECT * FROM usuarios WHERE id_usuario = ?",
                [result.insertId]
            );

            user = newUser[0];
        }

        const tokenJWT = jwt.sign(
            {
                id_usuario: user.id_usuario,
                email: user.email_usuario,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            result: user,
            token: tokenJWT,
            message: "Inicio de sesión con Google exitoso.",
        });
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

    let {
        apellido,
        nombre,
        password,
        email
    } = req.body;

    try {
        connection = await conectarBDMySql();

        const [existe] = await connection.execute(
            "SELECT * FROM usuarios WHERE email_usuario = ?",
            [email]
        );
        if (existe.length > 0)
            return res.status(400).json({ message: "El email ya está registrado." });

        //const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.execute(
            "INSERT INTO usuarios (nombre_usuario, apellido_usuario, password, email_usuario, id_rol, auth_provider) VALUES (?, ?, ?, ?, ?, ?)",
            [
                nombre,
                apellido,
                password,
                email,
                1,
                'manual'
            ]
        );

        const userId = result.insertId;

        const token = jwt.sign(
            { id_usuario: userId, email: email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Usuario creado exitosamente",
            status: "OK",
            userId,
            token,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

const actualizarUsuario = async (req, res) => {
    let connection;
    let { id } = req.params;
    let { dni, fecha_nacimiento, id_genero, telefono_usuario, email_usuario } = req.body;

    try {
        connection = await conectarBDMySql();

        if (fecha_nacimiento) {
            const partes = fecha_nacimiento.split('/');
            fecha_nacimiento = `${partes[2]}-${partes[1]}-${partes[0]}`; // 🔧 Formato correcto
        }


        const result = await connection.execute(
            "UPDATE usuarios SET  dni = ?, fecha_nacimiento = ?, id_genero = ?,telefono_usuario = ?, email_usuario = ? WHERE id_usuario = ?",
            [dni, fecha_nacimiento, id_genero, telefono_usuario, email_usuario, id]
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
    changePassword
};
