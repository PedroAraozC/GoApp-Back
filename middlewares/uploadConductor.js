import multer from "multer";
import path from "path";
import fs from "fs";

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id_conductor } = req.query;

    if (!id_conductor) {
      return cb(new Error("id_conductor es obligatorio"));
    }

    const basePath = path.join(
      process.cwd(),
      "../","imagenes",
      "conductores",
      String(id_conductor),
    );

    fs.mkdirSync(basePath, { recursive: true });
    cb(null, basePath);
  },

  filename: (req, file, cb) => {
    const { id_conductor, tipo_imagen } = req.query;
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();

    cb(null, `${tipo_imagen}_${id_conductor}_${timestamp}${ext}`);
  },
});

export const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ];

  if (!tiposPermitidos.includes(file.mimetype)) {
    return cb(
      new Error("Solo se permiten imágenes (JPG, PNG, WEBP) o archivos PDF"),
      false,
    );
  }

  cb(null, true);
};

export const uploadConductorImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
