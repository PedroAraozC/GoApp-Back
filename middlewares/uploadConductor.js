import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return cb(new Error("id_conductor es obligatorio"));
    }

    const basePath = path.join(
      process.cwd(),
      "imagenes",
      "conductores",
      String(id_conductor)
    );

    fs.mkdirSync(basePath, { recursive: true });
    cb(null, basePath);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const tipo = req.body.tipo_imagen;

    const filename = `${tipo}_${req.body.id_conductor}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Solo se permiten imágenes"), false);
  } else {
    cb(null, true);
  }
};

export const uploadConductorImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
