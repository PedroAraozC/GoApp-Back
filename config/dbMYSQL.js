import mysql from "mysql2/promise";

const conectarBDMySql = async () => {
  try {
    const connection = await mysql.createConnection({
      host: "186.123.85.22",
      port: 3306,
      user: "root",
      password: "qwe789**",
      database: "db_faketaxi",
      dateStrings: true,
    });
    console.log("Conexión a la base de datos MySQL establecida");
    return connection;
  } catch (error) {
    console.log(error.message);
  }
};

export { conectarBDMySql };
