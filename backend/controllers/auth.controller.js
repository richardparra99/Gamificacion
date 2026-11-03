const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

const generarToken = (usuario) => {
  return jwt.sign({ sub: String(usuario.id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });
};

const formatearUsuario = (usuario) => ({
  id: usuario.id,
  nombreCompleto: usuario.nombreCompleto,
  email: usuario.email,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nombreCompleto, email, password } = req.body;
    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = await db.usuario.findOne({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: "El correo electrónico ya está registrado",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = await db.usuario.create({
      nombreCompleto,
      email: emailNormalizado,
      password: passwordHash,
    });

    const token = generarToken(nuevoUsuario);

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: formatearUsuario(nuevoUsuario),
      token,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        mensaje: "El correo electrónico ya está registrado",
      });
    }

    console.error("Error al registrar usuario:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await db.usuario.findOne({
      where: { email: emailNormalizado },
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: formatearUsuario(usuario),
      token,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  return res.status(200).json({
    usuario: formatearUsuario(req.usuario),
  });
};
