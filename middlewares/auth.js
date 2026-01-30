import jwt from"jsonwebtoken"; // No instalado por el momento

// Middleware de autenticación para proteger rutas
export const auth = async (req, res, next) => {
  try {
    // 1. Obtener el token del header 'Authorization'
    const token = req.header("Authorization");

    // 2. Verificar y decodificar el token usando la clave secreta
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3. Guardar el id del usuario en el objeto request para usarlo en la siguiente función
    req.id = id;

    // 4. Llamar a next() para continuar con la siguiente función del middleware o controlador
    next();
  } catch (error) {
    // 5. Si ocurre un error (token inválido, expirado, etc.), responder con error 401 (no autorizado)
    res.status(401).json({ message: "Invalid token" });
  }
};

