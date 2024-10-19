const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Rendezvous = sequelize.define(
  "Rendezvous",
  {
    id_rendezvous: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id_user",
      },
    },
    objet_projet: {
      type: DataTypes.STRING, // Correction ici : utiliser STRING au lieu de VARCHAR
      allowNull: false,
      defaultValue: "",
    },
    rendezvous: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "rendezvous",
    timestamps: false,
  }
);

module.exports = Rendezvous;
