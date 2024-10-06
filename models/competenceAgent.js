const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CompetenceAgent = sequelize.define(
  "CompetenceAgent",
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
        model: "Agents",
        key: "id_agent",
      },
      primaryKey: true,
    },
  },
  {
    tableName: "competence_agent",
    timestamps: false,
  }
);

module.exports = CompetenceAgent;
