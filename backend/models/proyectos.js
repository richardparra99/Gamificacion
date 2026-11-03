const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Proyecto = sequelize.define(
    "Proyecto",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM("ACTIVO", "FINALIZADO"),
        defaultValue: "ACTIVO",
        allowNull: false,
      },
      propietarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "proyectos",
      timestamps: true,
    },
  );

  return Proyecto;
};
