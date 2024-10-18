const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const multer = require("multer");
const nodemailer = require("nodemailer");
const express = require("express");

// google strategy par douglasse
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false, // true pour 465, false pour d'autres ports
  auth: {
    user: "App@xdevis.com", // Votre adresse e-mail Zoho
    pass: "zQ7s ivkS NZRG", // Votre mot de passe ou mot de passe d'application
  },
});
async function envoyerMail(to, mdp) {
  try {
    let mailOption = {
      from: "App@xdevis.com",
      to: to,
      subject: "Code pour XDevis",
      html: `
      <h1 style="color:#007AFF;">Voici votre code</h1>
      <p><strong> ${mdp}</strong></p>
    
    `,
    };
    const info = await transporter.sendMail(mailOption);
    console.log("mail sent:" + info.response);
    // res.send({ infoMail: info.response });
  } catch (error) {
    throw error;
  }
}

// Assurez-vous que la stratégie est définie avant d'utiliser passport.authenticate
passport.use(
  "user",
  new LocalStrategy(
    {
      usernameField: "email_user", // Ceci doit correspondre au champ dans la requête
      passwordField: "password_user", // Ceci doit correspondre au champ dans la requête
    },
    async (email, password, done) => {
      try {
        // Chercher l'utilisateur dans la base de données
        const user = await User.findOne({ where: { email_user: email } }); // Ajustez en fonction de votre modèle
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        // Vérifiez le mot de passe (ajustez la méthode selon votre implémentation)
        const isMatch = await bcrypt.compare(password, user.password_user); // Assurez-vous que le mot de passe est haché
        if (!isMatch) {
          return done(null, false, { message: "Invalid password" });
        }

        // Si tout va bien, retournez l'utilisateur
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
      callbackURL: "http://localhost:5000/auth/google/callback", // Remplacez par votre URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Recherchez l'utilisateur dans votre base de données
        let user = await User.findOne({
          where: { email_user: profile.emails[0].value },
        });

        // Si l'utilisateur n'existe pas, créez-le
        if (!user) {
          user = await User.create({
            nom_user: profile.displayName,
            email_user: profile.emails[0].value,
            contact_user: "", // Vous pouvez ajouter une logique pour récupérer le numéro de téléphone si nécessaire
            password_user: "", // Ne pas stocker de mot de passe pour les utilisateurs Google
          });
        }

        // Passez l'utilisateur à la fonction de rappel
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

const create_user = async (req, res) => {
  console.log("Fonction create_user appelée"); // Log pour indiquer que la fonction est exécutée

  try {
    const {
      nom_user,
      contact_user,
      //  adresse_user,
      email_user,
      password_user,
    } = req.body;
    console.log(
      nom_user,
      contact_user,
      // adresse_user,
      email_user,
      password_user
    );
    // Log des données reçues
    console.log("Données reçues :", req.body);

    const exist = await User.findOne({
      where: {
        email_user,
      },
    });
    console.log(exist);
    if (exist)
      return res
        .status(400)
        .json({ success: false, message: "Email déjà existante" });
    // Hachage du mot de passe
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password_user, saltRounds);

    // Création de l'utilisateur
    const result = await User.create({
      nom_user,
      contact_user,
      // adresse_user,
      email_user,
      password_user: hashedPass, // On inclut le mot de passe haché
    });

    // console.log("Utilisateur créé avec succès :", result);

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    return res.status(400).json({
      error: err.message || "Erreur lors de la création de l'utilisateur.",
    });
  }
};

const update_user = async (req, res) => {
  try {
    const { nom_user, contact_user, adresse_user, email_user } = req.body;
    const id_user = req.params.id;
    const file = req.file;
    let schema = {
      nom_user,
      contact_user,
      adresse_user,
      email_user,
    };
    if (file) {
      const filePath = `../uploads/${file.filename}`;
      schema = {
        nom_user,
        contact_user,
        adresse_user,
        photo_user: filePath,
        email_user,
      };
    }

    const result = await User.update(schema, { where: { id_user } });
    const user = await User.findOne({ where: { id_user } });
    return res.status(200).json({ success: true, result, user });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error", success: false });
  }
};

const change_password_user = async (req, res) => {
  try {
    const { new_password, email_user, current_password } = req.body;
    // console.log(req.body);
    const user = await User.findOne({ where: { email_user } });
    if (!user) return res.status(400).json({ error: "user not found" });
    const isMatch = await bcrypt.compare(current_password, user.password_user);

    if (!isMatch) {
      return res.status(400).json({
        error: "Mot de passe error nouveau et ancien ne se correspondent pas",
        success: false,
      });
    }
    const saltRounds = 10;

    const hashedPass = await bcrypt.hash(new_password, saltRounds);

    const result = await User.update(
      {
        password_user: hashedPass,
      },
      { where: { id_user: user.id_user } }
    );
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error" });
  }
};

const delete_user = async (req, res) => {
  try {
    const id_user = req.params.id;
    const result = await User.destroy({ where: { id_user } });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Error" });
  }
};

const get_user = async (req, res) => {
  try {
    const result = await User.findAll();
    return res.status(200).json({ result, success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err, success: false });
  }
};

const jwtsecret = crypto.randomBytes(64).toString("hex");
//authentification user

const authenticationUser = (req, res, next) => {
  passport.authenticate("user", { session: false }, (err, user, info) => {
    if (err) {
      return next(err); // Gérer les erreurs d'authentification
    }
    if (!user) {
      // Si l'utilisateur n'est pas trouvé, retourner une erreur
      return res.status(400).json({
        message: "E-mail ou mot de passe incorrect!",
        success: false,
        info,
      });
    }

    // Si l'utilisateur est trouvé, créer un token JWT
    const token = jwt.sign({ userId: user.id_user }, jwtsecret, {
      expiresIn: "24h",
    });

    // Retourner une réponse avec succès et le token
    return res.status(200).json({
      success: true,
      message: "authentification succeded",
      token: token,
      user: user,
      isuser: false, // S'assurer que cela a du sens dans ton contexte
    });
  })(req, res, next);
};

const change_contact = async (req, res) => {
  try {
    const { nouveau_contact } = req.body;

    const id_user = req.params.id;

    const alreadyExist = await User.findOne({
      where: { contact_user: nouveau_contact },
    });

    if (alreadyExist) {
      res.status(400).json({ error: "Numero deja pris", success: false });
    }

    const result = await User.update(
      {
        contact_user: nouveau_contact,
      },
      { where: { id_user } }
    );

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error" });
  }
};

const mot_de_passe_oublie = async (req, res) => {
  try {
    const { email_user } = req.body;
    // console.log(email_user)
    const response = await User.findOne({ where: { email_user: email_user } });
    console.log(response);
    if (!response) {
      return res
        .status(400)
        .json({ error: "email non trouvée", success: false });
    }
    const password_resset = crypto.randomBytes(6).toString("hex");

    const saltRounds = 10;

    const hashedPass = await bcrypt.hash(password_resset, saltRounds);

    const result = await User.update(
      {
        password_user: hashedPass,
      },
      { where: { id_user: response.id_user } }
    );
    await envoyerMail(email_user, password_resset);
    return res.status(200).json({
      success: true,
      result,
      password_user: password_resset,
      email_user: email_user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "erreur interne", success: false });
  }
};

module.exports = {
  create_user,
  update_user,
  delete_user,
  get_user,
  authenticationUser,
  change_contact,
  change_password_user,
  mot_de_passe_oublie,
};
