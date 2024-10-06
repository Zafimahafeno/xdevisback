const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
// const Demande = require("./demande"); // Import Demande model

const Agent = sequelize.define(
  "Agent",
  {
    id_agent: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_agent: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    prenom_agent: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    photo_agent: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_agent: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    adresse_agent: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "disponible",
    },
    membre: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "en_cours",
    },
  },
  {
    tableName: "agent",
    timestamps: false,
  }
);

module.exports = Agent;
