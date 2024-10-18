const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_user: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_user: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    // adresse_user: {
    //   type: DataTypes.STRING(255),
    //   allowNull: true,
    // },
    email_user: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // photo_user: {
    //   type: DataTypes.STRING(255),
    //   allowNull: true,
    // },
    password_user: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "user",
    timestamps: false,
  }
);

// // Define one-to-one association (User has one Demande)
// User.hasOne(Demande, {
//   foreignKey: "id_user",
//   sourceKey: "id_user",
// });

module.exports = User;
