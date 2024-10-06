const Sequelize = require("sequelize");

const sequelize = new Sequelize("mahafeno_xdevis", "mahafeno", "antso0201", {
  dialect: "mysql",
  host: "mysql-mahafeno.alwaysdata.net",
});

module.exports = sequelize;
