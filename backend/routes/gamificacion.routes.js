const router = require("express").Router();

const controller = require("../controllers/gamificacion.controller");

const verificarToken = require("../middleware/auth.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);
router.get("/me", controller.miPerfil);
router.get("/historial", controller.historial);
router.get("/ranking", controller.ranking);

module.exports = router;
