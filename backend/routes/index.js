const authRoutes = require("./auth.routes");
const actividadRoutes = require("./actividad.routes");
const proyectoRoutes = require("./proyecto.routes");
const proyectoActividadRoutes = require("./proyectoActividad.routes");

module.exports = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/actividades", actividadRoutes);
  app.use("/api/proyectos", proyectoRoutes);
  app.use("/api/proyectos", proyectoActividadRoutes);
};
