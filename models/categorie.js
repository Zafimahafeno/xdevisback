const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adapter le chemin en fonction de votre configuration

const Categorie = sequelize.define(
  "Categorie",
  {
    id_categorie: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_categorie: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    description_categorie: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "Categorie",
    timestamps: false,
  }
);

module.exports = Categorie;
