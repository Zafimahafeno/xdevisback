const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ServiceDemande = sequelize.define(
  "ServiceDemande",
  {
    id_service: {
      type: DataTypes.INTEGER,
      references: {
        model: "Services",
        key: "id_service",
      },
      primaryKey: true,
    },
    id_agent: {
      type: DataTypes.INTEGER,
      references: {
        model: "Demandes",
        key: "id_demande",
      },
      primaryKey: true,
    },
  },
  {
    tableName: "service_demande",
    timestamps: false,
  }
);

module.exports = ServiceDemande;
