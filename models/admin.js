const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adapter le chemin en fonction de votre configuration

const Admin = sequelize.define(
  "Admin",
  {
    id_admin: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username_admin: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    password_admin: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "admin",
    timestamps: false,
  }
);

module.exports = Admin;
