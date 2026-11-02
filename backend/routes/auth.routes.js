const router = require("express").Router();

const authController = require("../controllers/auth.controller");
const validateJson = require("../middleware/validation.middleware");
const verificarToken = require("../middleware/auth.middleware");

const { registerSchema, loginSchema } = require("../validators/auth.schema");

router.post("/register", validateJson(registerSchema), authController.register);

router.post("/login", validateJson(loginSchema), authController.login);

router.get("/me", verificarToken, authController.me);

module.exports = router;
