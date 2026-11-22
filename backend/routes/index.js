const authRoutes = require("./auth.routes");
const actividadRoutes = require("./actividad.routes");
const proyectoRoutes = require("./proyecto.routes");
const proyectoActividadRoutes = require("./proyectoActividad.routes");
const gamificacionRoutes = require("./gamificacion.routes");
const reporteRoutes = require("./reporte.routes");

module.exports = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/actividades", actividadRoutes);
  app.use("/api/proyectos", proyectoRoutes);
  app.use("/api/proyectos", proyectoActividadRoutes);
  app.use("/api/gamificacion", gamificacionRoutes);
  app.use("/api/reportes", reporteRoutes);
};
