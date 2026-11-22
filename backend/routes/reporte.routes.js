const router = require("express").Router();

const controller = require("../controllers/reporte.controller");

const verificarToken = require("../middleware/auth.middleware");

// Todas las rutas requieren JWT
router.use(verificarToken);

// Resumen de actividades personales
router.get("/resumen", controller.resumenPersonal);

// Historial diario de cumplimientos personales
router.get("/historial", controller.historialPersonal);

// Progreso general de un proyecto
router.get("/proyectos/:id", controller.resumenProyecto);

// Estadísticas de los integrantes
router.get("/proyectos/:id/miembros", controller.reporteMiembros);

module.exports = router;
