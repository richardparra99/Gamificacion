const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MovimientoPuntos = sequelize.define(
    "MovimientoPuntos",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      cumplimientoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      puntos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },

      motivo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
    },
    {
      tableName: "movimientos_puntos",
      timestamps: true,
    },
  );

  return MovimientoPuntos;
};
