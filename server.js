const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const nodemailer = require("nodemailer");
const sequelize = require("./config/database");
const multer = require("multer"); // Assurez-vous d'importer multer ici
// Socket
const http = require("http");

// Initialisation de l'application
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// Configuration de multer pour gérer l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/clients/"); // Dossier où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Renommer le fichier
  },
});
const upload = multer({ storage: storage }); // Utilisez multer avec la configuration définie

// Routes
const userRoutes = require("./routes/userroute");
const routes = require("./routes");
app.use("/api", routes);
app.use("/api/user", userRoutes);

// Créer le serveur HTTP
const server = http.createServer(app);

// Route pour envoyer l'email
// app.post("/send-email", upload.single("photo_projet"), (req, res) => {
//   console.log(req.file); // Vérifiez si le fichier est bien reçu
//   const { description_projet, rendezvous, objet_projet } = req.body;
//   if (!req.file) {
//     return res.status(400).send({ message: "Aucun fichier reçu." });
//   }

//   const photo_projet = req.file.path; // Chemin du fichier téléchargé

//   // Créer un transporteur pour envoyer l'email via Gmail
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "zanajaona2404@gmail.com",
//       pass: "rwhs wjqp lexx rftu",
//     },
//   });

//   // Configuration de l'email
//   const mail_configs = {
//     from: "zanajaona2404@gmail.com",
//     to: "zanajaona2404@gmail.com",
//     subject: "Nouveau projet soumis pour CONSULTIZE",
//     html: `
//     <h1 style="color:#007AFF;">Nouveau Projet Soumis</h1>
//     <p><strong>Objet du projet :</strong> ${objet_projet}</p>
//     <p><strong>Description du projet :</strong></p>
//     <p style="color:#333;">${description_projet}</p>
//     <p><strong>Date du rendez-vous :</strong> ${
//       rendezvous ? rendezvous : "Non précisée"
//     }</p>
//   `,
//     attachments: [
//       {
//         path: photo_projet, // Attacher le fichier téléchargé
//       },
//     ],
//   };

//   // Envoyer l'email
//   transporter.sendMail(mail_configs, function (error, info) {
//     if (error) {
//       console.log("Erreur lors de l'envoi de l'email :", error);
//       return res
//         .status(500)
//         .send({ message: "Erreur lors de l'envoi de l'email" });
//     }
//     console.log("Email envoyé avec succès :", info.response);
//     return res.status(200).send({
//       message:
//         "Email envoyé avec succès! Nous vous contacterons prochainement!",
//     });
//   });
// });

app.post("/send-email", (req, res) => {
  const { description_projet, rendezvous, objet_projet } = req.body;

  // Chemin du fichier téléchargé

  // Créer un transporteur pour envoyer l'email via Zoho
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false, // true pour 465, false pour d'autres ports
    auth: {
      user: "App@xdevis.com", // Votre adresse e-mail Zoho
      pass: "zQ7s ivkS NZRG", // Votre mot de passe ou mot de passe d'application
    },
  });

  // Configuration de l'email
  const mail_configs = {
    from: "lovanomeny72@gmail.com",
    to: "App@xdevis.com",
    subject: "Nouveau projet soumis pour CONSULTIZE",
    html: `
      <h1 style="color:#007AFF;">Nouveau Projet Soumis</h1>
      <p><strong>Objet du projet :</strong> ${objet_projet}</p>
      <p><strong>Description du projet :</strong></p>
      <p style="color:#333;">${description_projet}</p>
      <p><strong>Date du rendez-vous :</strong> ${
        rendezvous ? rendezvous : "Non précisée"
      }</p>
    `,
  };

  // Envoyer l'email
  transporter.sendMail(mail_configs, function (error, info) {
    if (error) {
      console.log("Erreur lors de l'envoi de l'email :", error);
      return res
        .status(500)
        .send({ message: "Erreur lors de l'envoi de l'email" });
    }
    console.log("Email envoyé avec succès :", info.response);
    return res.status(200).send({
      message:
        "Email envoyé avec succès! Nous vous contacterons prochainement!",
    });
  });
});
const User = require("./models/user");
const Projet = require("./models/projet");
const Media = require("./models/media");

// Associations
User.hasMany(Projet, {
  foreignKey: "id_user",
  as: "projet",
});
Projet.belongsTo(User, {
  foreignKey: "id_user",
  as: "user",
});

Projet.hasMany(Media, {
  foreignKey: "id_projet",
  as: "media",
});
Media.belongsTo(Projet, {
  foreignKey: "id_projet",
  as: "projet",
});

// Test Route
app.get("/", async (req, res) => {
  res.send("Hello");
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback après l'authentification
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Créer un token JWT après l'authentification
    const token = jwt.sign({ userId: req.user.id_user }, jwtsecret, {
      expiresIn: "24h",
    });

    // Retourner une réponse avec succès et le token
    res.status(200).json({
      success: true,
      message: "Authentification réussie",
      token: token,
      user: req.user,
      isuser: false,
    });
  }
);

// Sync Database
const syncDatabase = async () => {
  try {
    await sequelize.sync({
      // alter:true
    });
    console.log("Database and tables synced successfully.");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

// Start the Server
const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Sync the database
syncDatabase();
