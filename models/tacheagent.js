const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TacheAgent = sequelize.define(
  "TacheAgent",
  {
    id_tache: {
      type: DataTypes.INTEGER,
      references: {
        model: "Taches",
        key: "id_tache",
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
    tableName: "tache_agent",
    timestamps: false,
  }
);

module.exports = TacheAgent;
