const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const demande = sequelize.define(
  "demande",
  {
    id_projet: {
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
      type: DataTypes.STRING,  // Correction ici : utiliser STRING au lieu de VARCHAR
      allowNull: false,
      defaultValue: "",  // Indiquer une valeur par défaut
    },
    
    rendezvous: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "projet",
    timestamps: true,
  }
);

// Define associations

module.exports = demande;
