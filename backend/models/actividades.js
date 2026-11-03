const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Actividad = sequelize.define(
    "Actividad",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM("UNICA", "RECURRENTE"),
        allowNull: false,
      },
      frecuencia: {
        type: DataTypes.ENUM("DIARIA", "SEMANAL"),
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM("PENDIENTE", "COMPLETADA"),
        allowNull: false,
        defaultValue: "PENDIENTE",
      },
      fechaLimite: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Proyecto al que pertenece la actividad
      proyectoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Usuario responsable de completarla
      asignadoAId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "actividades",
      timestamps: true,
    },
  );

  return Actividad;
};
