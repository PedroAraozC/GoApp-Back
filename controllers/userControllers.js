const bcrypt = require("bcryptjs");
const { conectarBDMySql } = require("../config/dbMYSQL");

//FUNCION A MODO DE EJEMPLO
const login = async (req, res) => {
    // La funcion es asoncrónica para manejar operaciones de base de datos y esperar respuestas

    let connection; // 1. Declarar la variable de conexión fuera del try para poder cerrarla después

    try {
        // 2. Intentar conectar a la base de datos
        connection = await conectarBDMySql();

        // 3. Extraer dni y password del body de la petición
        const { dni, password } = req.body;

        // 4. Validar que ambos campos estén presentes
        if (!dni || !password)
            throw new CustomError("Usuario y contraseña son requeridas", 400);

        // 5. Buscar el usuario por DNI
        const [result] = await connection.execute(
            "SELECT persona.*, tipo_usuario.nombre_tusuario AS tipoDeUsuario FROM persona JOIN tipo_usuario ON persona.id_tusuario = tipo_usuario.id_tusuario WHERE persona.documento_persona = ?",
            [dni]
        );

        // 6. Si no se encuentra el usuario, lanzar error personalizado
        if (result.length == 0) throw new CustomError("Usuario no encontrado", 404);

        // 7. Validar si el usuario está habilitado y validado
        if (result[0].validado == 0 || result[0].habilita == 0)
            throw new CustomError(
                "Usuario pendiente de validación. Seleccione la opción 'Reenviar email de validación'.",
                400
            );

        // 8. Validar si el usuario está validado (doble chequeo)
        if (result[0].validado == 0)
            throw new CustomError(
                "Usuario no validado. Revise su correo o reenvie el email de validación",
                404
            );

        // 9. Obtener los permisos del usuario
        const permiso_persona = await connection.execute(
            "SELECT permiso_persona.*,proceso.nombre_proceso AS proceso,proceso.habilita AS habilitado FROM permiso_persona JOIN proceso ON permiso_persona.id_proceso=proceso.id_proceso WHERE permiso_persona.id_persona = ?",
            [result[0].id_persona]
        );

        // 10. Comparar la contraseña ingresada con la almacenada (encriptada)
        const passOk = await bcrypt.compare(password, result[0].clave);
        if (!passOk) throw new CustomError("Contraseña incorrecta", 400);

        // 11. Generar el token JWT para el usuario
        const token = jwt.sign(
            { id: result[0].id_persona },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "24h",
            }
        );

        // 12. Eliminar la clave antes de enviar la respuesta por seguridad
        const { clave, ...usuarioSinContraseña } = result[0];

        // 13. Enviar respuesta exitosa con el token y los datos del usuario
        res.status(200).json({
            message: "Ingreso correcto",
            ok: true,
            token,
            user: { usuarioSinContraseña, permisos: permiso_persona[0] },
        });
    } catch (error) {
        // 14. Si ocurre cualquier error, responder con el código y mensaje correspondiente
        res
            .status(error.code || 500)
            .json({ message: error.message || "algo explotó :|" });
    } finally {
        // 15. Siempre cerrar la conexión a la base de datos, ocurra o no un error
        if (connection) {
            await connection.end();
        }
    }
};

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

const crearUsuario = async (req, res) => {
    let connection;

    try {
        let { nombre_usuario, apellido_usuario, dni, fecha_nacimiento, id_genero, password, telefono_usuario, email_usuario, id_rol } = req.body;
        connection = await conectarBDMySql();

        console.log("Campos recibidos:", {
            nombre_usuario,
            apellido_usuario,
            dni,
            fecha_nacimiento,
            id_genero,
            password,
            telefono_usuario,
            email_usuario,
            id_rol
        });

        // Reemplazar undefined por null
        nombre_usuario = nombre_usuario ?? null;
        apellido_usuario = apellido_usuario ?? null;
        dni = dni ?? null;
        fecha_nacimiento = fecha_nacimiento ?? null;
        id_genero = id_genero ?? null;
        password = password ?? null;
        telefono_usuario = telefono_usuario ?? null;
        email_usuario = email_usuario ?? null;
        id_rol = id_rol ?? null;

        // Validación básica
        if (
            nombre_usuario === null ||
            apellido_usuario === null ||
            dni === null ||
            fecha_nacimiento === null ||
            id_genero === null ||
            password === null ||
            telefono_usuario === null ||
            email_usuario === null ||
            id_rol === null
        ) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const result = await connection.execute("INSERT INTO usuarios (nombre_usuario, apellido_usuario, dni, fecha_nacimiento, id_genero, password, telefono_usuario, email_usuario, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [nombre_usuario, apellido_usuario, dni, fecha_nacimiento, id_genero, password, telefono_usuario, email_usuario, id_rol]);

        console.log(nombre_usuario, apellido_usuario, dni, fecha_nacimiento, id_genero, password, telefono_usuario, email_usuario, id_rol);
        res.json({ message: "Usuario creado exitosamente", status: "OK", userId: result[0].insertId });

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
        const { id } = req.params;
        const { nombre_usuario, apellido_usuario, documento_usuario, fecha_nacimiento, id_genero, password, telefono_usuario, email_usuario, id_rol } = req.body;
        connection = await conectarBDMySql();

        const result = await connection.execute("UPDATE usuarios SET nombre_usuario = ?, apellido_usuario = ?, documento_usuario = ?, fecha_nacimiento = ?, id_genero = ?, password = ?, telefono_usuario = ?, email_usuario = ?, id_rol = ? WHERE id_usuario = ?",
            [nombre_usuario, apellido_usuario, documento_usuario, fecha_nacimiento, id_genero, password, telefono_usuario, email_usuario, id_rol, id]);

        res.json({ message: "Usuario actualizado exitosamente", status: "OK" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar usuario" });
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

        const result = await connection.execute("UPDATE usuarios SET habilita = 0 WHERE id_usuario = ?", [id]);

        res.json({ message: "Usuario eliminado exitosamente", status: "OK" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar usuario" });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// 16. Exportar la función login
module.exports = { login, obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };
