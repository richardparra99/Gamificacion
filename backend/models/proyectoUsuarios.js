const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProyectoUsuario = sequelize.define(
    "ProyectoUsuario",
    {
      proyectoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM("ADMIN", "MIEMBRO"),
        defaultValue: "MIEMBRO",
        allowNull: false,
      },
    },
    {
      tableName: "proyecto_usuarios",
      timestamps: true,
    },
  );

  return ProyectoUsuario;
};
