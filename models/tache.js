const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user"); // Import User model
const Agent = require("./agent"); // Import Agent model
const Service = require("./service"); // Import Service model

const Tache = sequelize.define(
  "Tache",
  {
    id_tache: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Reference the User model
        key: "id_user",
      },
    },
    id_agent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Agent, // Reference the Agent model
        key: "id_agent",
      },
    },
    id_service: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Service, // Reference the Service model
        key: "id_service",
      },
    },
    description_tache: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Aucune description",
    },
    date_tache: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status_tache: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "en_cours",
    },
  },
  {
    tableName: "tache",
    timestamps: false,
  }
);

module.exports = Tache;
