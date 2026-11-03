const router = require("express").Router();

const controller = require("../controllers/proyecto.controller");

const verificarToken = require("../middleware/auth.middleware");
const validateJson = require("../middleware/validation.middleware");

const {
  crearProyectoSchema,
  actualizarProyectoSchema,
  agregarMiembroSchema,
} = require("../validators/proyecto.schema");

router.use(verificarToken);
router.post("/", validateJson(crearProyectoSchema), controller.crear);
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.put("/:id", validateJson(actualizarProyectoSchema), controller.actualizar);
router.post("/:id/miembros", validateJson(agregarMiembroSchema), controller.agregarMiembro);
router.delete("/:id/miembros/:usuarioId", controller.eliminarMiembro);
router.delete("/:id", controller.eliminar);

module.exports = router;
