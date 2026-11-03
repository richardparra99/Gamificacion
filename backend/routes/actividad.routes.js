const router = require("express").Router();

const controller = require("../controllers/actividad.controller");

const verificarToken = require("../middleware/auth.middleware");
const validateJson = require("../middleware/validation.middleware");

const {
  crearActividadSchema,
  actualizarActividadSchema,
} = require("../validators/actividad.schema");

// Todas las rutas requieren JWT
router.use(verificarToken);
router.post("/", validateJson(crearActividadSchema), controller.crear);
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.put("/:id", validateJson(actualizarActividadSchema), controller.actualizar);
router.post("/:id/completar", controller.completar);
router.get("/:id/historial", controller.historial);
router.delete("/:id", controller.eliminar);

module.exports = router;
