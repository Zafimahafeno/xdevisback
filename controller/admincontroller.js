const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
//authentification using passport //initialisation

passport.use(
  "admin",
  new LocalStrategy(
    { usernameField: "username_admin", passwordField: "password_admin" },
    async (username_admin, password_admin, done) => {
      try {
        await Admin.findOne({
          where: {
            username_admin: username_admin,
          },
        }).then((user) => {
          if (!user) {
            return done(null, false, {
              message: "Username ou mot de passe error",
            });
          }
          bcrypt.compare(
            password_admin,
            user.password_admin,
            (err, isMatch) => {
              if (err) {
                console.log("aischwcbwubweverr", err);
                throw err;
              }
              if (isMatch) {
                console.log("isMatch  osdi wieuh wieuhwe ", isMatch);
                return done(null, user);
              } else {
                console.log("ismatch auincw weiubw eiu", isMatch);
                return done(null, false, { message: "Password incorrect" });
              }
            }
          );
        });
      } catch (e) {
        console.log(e);
        return done(e);
      }
    }
  )
);

// authentification

const jwtsecret = crypto.randomBytes(64).toString("hex");
//authentification admin
const authenticationAdmin = (req, res, next) => {
  passport.authenticate("admin", { session: false }, (err, user, info) => {
    if (err) {
      console.log("Error", err);
      return next(err);
    }
    if (!user) {
      return res.json({ message: "Erreur d'authentification", info });
    }
    const token = jwt.sign({ userId: user.id_admin }, jwtsecret, {
      expiresIn: "24h",
    });
    return res.send({
      message: "authentification succeded",
      token: token,
      user: user,
      isAdmin: true,
    });
  })(req, res, next);
  // res.json({ message: "authenticated success", user: req.user, token: "" });
};

const create_admin = async (req, res) => {
  try {
    const { username_admin, password_admin } = req.body;

    const saltRounds = 10;

    const hashedPass = await bcrypt.hash(password_admin, saltRounds);

    const result = await Admin.create({
      username_admin,
      password_admin: hashedPass,
    });

    return res.status(200).json({ succes: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error" });
  }
};

const change_password_admin = async (req, res) => {
  try {
    const { new_password, username_admin, current_password } = req.body;

    const admin = await Admin.findOne({ where: username_admin });
    const isMatch = await bcrypt.compare(
      current_password,
      admin.password_admin
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Mot de passe error", succes: false });
    }
    const saltRounds = 10;

    const hashedPass = await bcrypt.hash(new_password, saltRounds);

    const result = await Admin.update(
      {
        password_admin: hashedPass,
      },
      { where: { id_admin: admin.id_admin } }
    );
    return res.status(200).json({ succes: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error" });
  }
};

const get_admin = async () => {
  try {
    const result = await Admin.findAll();

    return res.status(200).json({ result, succes: true });
  } catch (error) {
    res.json({ err: error });
  }
};
module.exports = {
  change_password_admin,
  authenticationAdmin,
  create_admin,
  get_admin,
};
