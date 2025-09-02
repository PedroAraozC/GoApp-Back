const bcrypt = require("bcryptjs");
const { conectarBDMySql } = require("../config/dbMYSQL");

//FUNCION A MODO DE EJEMPLO

const obtenerUsuarios = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    console.log("first");
    const result = await connection.execute("SELECT * FROM usuarios ");
    console.log(result);
    res.json({ generos: result[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

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
// 16. Exportar la función login
module.exports = { login, obtenerUsuarios };
