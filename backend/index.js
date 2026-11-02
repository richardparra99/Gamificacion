require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/db.config");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Gamificación funcionando",
    baseDatos: "PostgreSQL",
  });
});

require("./routes")(app);

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL conectado correctamente");

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar PostgreSQL:", error);
    process.exit(1);
  }
}

iniciarServidor();
