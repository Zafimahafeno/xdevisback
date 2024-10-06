const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Demande = require("./demande"); // Import Demande model
const Categorie = require("./categorie");
const Service = sequelize.define(
  "Service",
  {
    id_service: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_categorie: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Categorie, // Reference the Categorie model
        key: "id_categorie",
      },
    },
    titre_service: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description_service: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    photo_service: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    prix_service: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "service",
    timestamps: false,
  }
);

module.exports = Service;
