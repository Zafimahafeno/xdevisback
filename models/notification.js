const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adapter le chemin en fonction de votre configuration
const User = require("./user");

const Notification = sequelize.define(
  "Notification",
  {
    id_notif: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id_user",
      },
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin",
    },
    value_notif: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "notification",
    timestamps: true,
  }
);

module.exports = Notification;
