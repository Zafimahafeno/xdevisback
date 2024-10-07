const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const multer = require("multer");
const nodemailer = require("nodemailer");
const express = require("express");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zanajaona2404@gmail.com",
    pass: "rwhs wjqp lexx rftu",
  },
});

async function envoyerMail(to, subject, text) {
  try {
    let mailOption = {
      from: "zanajaona2404@gmail.com",
      to: to,
      subject: subject,
      text: text,
      html: "",
    };
    const info = await transporter.sendMail(mailOption);
    console.log("mail sent:" + info.response);
    // res.send({ infoMail: info.response });
  } catch (error) {
    throw error;
  }
}


// Assurez-vous que la stratégie est définie avant d'utiliser passport.authenticate
passport.use('user', new LocalStrategy({
  usernameField: 'email_user', // Ceci doit correspondre au champ dans la requête
  passwordField: 'password_user' // Ceci doit correspondre au champ dans la requête
}, async (email, password, done) => {
  try {
    // Chercher l'utilisateur dans la base de données
    const user = await User.findOne({ where: { email_user: email } }); // Ajustez en fonction de votre modèle
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    
    // Vérifiez le mot de passe (ajustez la méthode selon votre implémentation)
    const isMatch = await bcrypt.compare(password, user.password_user); // Assurez-vous que le mot de passe est haché
    if (!isMatch) {
      return done(null, false, { message: 'Invalid password' });
    }

    // Si tout va bien, retournez l'utilisateur
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));


const create_user = async (req, res) => {
  console.log("Fonction create_user appelée"); // Log pour indiquer que la fonction est exécutée

  try {
    const {
      nom_user,
      contact_user,
      adresse_user,
      email_user,
      password_user,
    } = req.body;
    const file = req.file;

    // Log des données reçues
    console.log("Données reçues :", req.body);
    console.log("Fichier reçu :", file);

    // Vérifiez si le fichier a bien été téléchargé
    if (!file) {
      console.error("Aucun fichier fourni.");
      return res.status(400).json({ error: "No file", success: false });
    }

    // Vérification si l'utilisateur existe déjà
    const alreadyExist = await User.findOne({ where: { contact_user } });
    const alreadyExist2 = await User.findOne({ where: { email_user } });

    if (alreadyExist || alreadyExist2) {
      console.error("Utilisateur déjà existant avec cet email ou numéro de contact.");
      return res.status(400).json({ error: "Numero ou email deja pris", success: false });
    }

    // Hachage du mot de passe
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password_user, saltRounds);

    // Chemin de fichier pour stocker l'image
    const filePath = `../uploads/${file.filename}`;

    // Création de l'utilisateur
    const result = await User.create({
      nom_user,
      contact_user,
      adresse_user,
      email_user,
      photo_user: filePath,
      password_user: hashedPass,
    });

    console.log("Utilisateur créé avec succès :", result);

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    return res.status(400).json({ error: err.message || "Erreur lors de la création de l'utilisateur." });
  }
};


const update_user = async (req, res) => {
  try {
    const {
      nom_user,
      contact_user,
      adresse_user,
      email_user,
    } = req.body;
    const id_user = req.params.id;
    const file = req.file;
    let schema = {
      nom_user,
      prenom_user,
      contact_user,
      adresse_user,
      email_user,
    };
    if (file) {
      const filePath = `../uploads/${file.filename}`;
      schema = {
        nom_user,
        prenom_user,
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
    const { new_password, contact_user, current_password } = req.body;
    // console.log(req.body);
    const user = await User.findOne({ where: { contact_user } });
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
      return res.status(400).json({ message: "authentication failed", success: false, info });
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
    const response = await User.findOne({ where: { email_user: email_user } });
    if (!response) {
      return res
        .status(400)
        .json({ error: "email non trouvee", success: false });
    }

    const password_resset = crypto.randomBytes(8).toString("hex");

    const saltRounds = 10;

    const hashedPass = await bcrypt.hash(password_resset, saltRounds);

    const result = await User.update(
      {
        password_user: hashedPass,
      },
      { where: { id_user: response.id_user } }
    );
    await envoyerMail(
      response.email,
      "Renouveau de mot de passe",
      `Votre code est la suivante : \n\n${password_resset}\n\nUtiliser ce code pour acceder à votre compte puis changer votre votre mot de passe `
    );
    return res.status(200).json({
      success: true,
      result,
      password_user: password_resset,
      contact_user: response.contact_user,
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
