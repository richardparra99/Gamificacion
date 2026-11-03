const router = require("express").Router();
const controller = require("../controllers/proyectoActividad.controller");
const verificarToken = require("../middleware/auth.middleware");
const validateJson = require("../middleware/validation.middleware");
const { crearActividadSchema } = require("../validators/actividad.schema");
const { asignarActividadSchema } = require("../validators/asignacion.schema");

// Todas las rutas requieren JWT
router.use(verificarToken);

// Crear actividad dentro del proyecto
router.post("/:id/actividades", validateJson(crearActividadSchema), controller.crear);

// Listar actividades del proyecto
router.get("/:id/actividades", controller.listar);

// Asignar responsable
router.put("/:id/actividades/:actividadId/asignar", validateJson(asignarActividadSchema),controller.asignar);

// Completar actividad
router.post("/:id/actividades/:actividadId/completar", controller.completar);

module.exports = router;
