const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Cumplimiento = sequelize.define(
    "Cumplimiento",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      actividadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      periodo: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      tableName: "cumplimientos",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["actividadId", "periodo"],
        },
      ],
    },
  );

  return Cumplimiento;
};
