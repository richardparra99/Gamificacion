const { sequelize, Sequelize } = require("../config/db.config");

const usuario = require("../models/usuarios")(sequelize);

module.exports = {
  sequelize,
  Sequelize,
  usuario,
};
