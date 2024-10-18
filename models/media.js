const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adapter le chemin en fonction de votre configuration

const Media = sequelize.define(
  "Media",
  {
    id_media: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "media",
    timestamps: false,
  }
);

module.exports = Media;
