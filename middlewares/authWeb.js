import jwt from "jsonwebtoken";

export const authWeb = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.id_usuario = decoded.id_usuario;
    req.id_rol = decoded.id_rol;
    req.email = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
