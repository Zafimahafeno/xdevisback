const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Projet = sequelize.define(
  "projet",
  {
    id_projet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user:{
      type:DataTypes.INTEGER,
      references:{
        model:User,
        key:"id_user"
      },
      allowNull:false
    },
    objet_projet: {
      type: DataTypes.STRING, // Correction ici : utiliser STRING au lieu de VARCHAR
      allowNull: false,
      defaultValue: "",
    },
    description_projet: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },

    rendezvous:{
      type:DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    is_brouillon:{
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:0
    }
  },
  {
    tableName: "projet",
    timestamps: true,
  }
);

// Define associations

module.exports = Projet;
