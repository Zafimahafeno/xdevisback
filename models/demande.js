const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Demande = sequelize.define(
  "Demande",
  {
    id_demande: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description_projet: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },

    photo_projet: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    rendezvous: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "projet",
    timestamps: true,
  }
);

// Define associations

module.exports = Demande;
