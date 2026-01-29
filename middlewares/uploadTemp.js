import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { sessionId } = req.body;

    if (!sessionId) {
      return cb(new Error("sessionId es obligatorio"));
    }

    const tempPath = path.join(
      process.cwd(),
      "uploads",
      "temp",
      `session_${sessionId}`
    );

    fs.mkdirSync(tempPath, { recursive: true });
    cb(null, tempPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const tipo = req.body.tipo_imagen;
    cb(null, `${tipo}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/", "application/pdf"];
  if (allowed.some((t) => file.mimetype.startsWith(t))) {
    cb(null, true);
  } else {
    cb(new Error("Solo imágenes o PDF"));
  }
};

export const uploadTemp = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
