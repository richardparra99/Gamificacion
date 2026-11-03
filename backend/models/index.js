const { sequelize, Sequelize } = require("../config/db.config");

const usuario = require("./usuarios")(sequelize);
const actividad = require("./actividades")(sequelize);
const cumplimiento = require("./cumplimientos")(sequelize);
const proyecto = require("./proyectos")(sequelize);
const proyectoUsuario = require("./proyectoUsuarios")(sequelize);

// Usuario creador de actividades
usuario.hasMany(actividad, {
  foreignKey: "usuarioId",
  as: "actividades",
});

actividad.belongsTo(usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
});

// Actividad y cumplimientos
actividad.hasMany(cumplimiento, {
  foreignKey: "actividadId",
  as: "cumplimientos",
  onDelete: "CASCADE",
});

cumplimiento.belongsTo(actividad, {
  foreignKey: "actividadId",
  as: "actividad",
});

// Propietario de proyectos
usuario.hasMany(proyecto, {
  foreignKey: "propietarioId",
  as: "proyectosCreados",
});

proyecto.belongsTo(usuario, {
  foreignKey: "propietarioId",
  as: "propietario",
});

// Miembros de proyectos (N:M)
usuario.belongsToMany(proyecto, {
  through: proyectoUsuario,
  foreignKey: "usuarioId",
  otherKey: "proyectoId",
  as: "proyectos",
});

proyecto.belongsToMany(usuario, {
  through: proyectoUsuario,
  foreignKey: "proyectoId",
  otherKey: "usuarioId",
  as: "miembros",
});

// Proyecto y actividades (1:N)
proyecto.hasMany(actividad, {
  foreignKey: "proyectoId",
  as: "actividades",
});

actividad.belongsTo(proyecto, {
  foreignKey: "proyectoId",
  as: "proyecto",
});

// Usuario responsable de actividades (1:N)
usuario.hasMany(actividad, {
  foreignKey: "asignadoAId",
  as: "actividadesAsignadas",
});

actividad.belongsTo(usuario, {
  foreignKey: "asignadoAId",
  as: "responsable",
});

module.exports = {
  sequelize,
  Sequelize,
  usuario,
  actividad,
  cumplimiento,
  proyecto,
  proyectoUsuario,
};
