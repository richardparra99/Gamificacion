const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UsuarioLogro = sequelize.define(
    "UsuarioLogro",
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

      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "usuario_logros",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["usuarioId", "codigo"],
        },
      ],
    },
  );

  return UsuarioLogro;
};
