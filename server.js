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

const User = require("./models/user");
const Projet = require("./models/projet");
const Media = require("./models/media");
const Rendezvous = require("./models/rendezvous");
const { format } = require("date-fns-tz"); // Import zonedTimeToUtc
const { parseISO } = require("date-fns");
const { fr } = require("date-fns/locale");
// Function to format the date
function formatDateUTC(date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}


app.post("/send-email", async (req, res) => {
  const { description_projet, rendezvous, objet_projet, id_user } = req.body;
  const user = await User.findOne({
    where: {
      id_user,
    },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Utilisateur introuvable" });
  }
  console.log(rendezvous, objet_projet, id_user);

  // Format the rendezvous date
  let formattedRendezvous = "Non précisée"; // Default value
  if (rendezvous) {
    const date = new Date(rendezvous);
    formattedRendezvous = formatDateUTC(date); // Format to your desired forma
    console.log(formattedRendezvous);
  }

  await Rendezvous.create({ rendezvous, id_user, objet_projet });

  // Create a transporter to send the email via Zoho
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "App@xdevis.com", // Your Zoho email address
      pass: "zQ7s ivkS NZRG", // Your password or application-specific password
    },
  });

  // Email configuration
  const mail_configs = {
    from: user.email_user,
    to: "App@xdevis.com",
    subject: "Nouveau projet soumis pour CONSULTIZE",
    html: `
      <h1 style="color:#007AFF;">Nouveau Projet Soumis</h1>
      <p><strong>Objet du projet :</strong> ${objet_projet}</p>
      <p><strong>Description du projet :</strong>${
        description_projet || "Non précisée"
      }</p>
      <p><strong>Date du rendez-vous :</strong> ${formattedRendezvous}</p>
    `,
  };

  // Send the email
  transporter.sendMail(mail_configs, function (error, info) {
    if (error) {
      console.log("Erreur lors de l'envoi de l'email :", error);
      return res
        .status(500)
        .send({ message: "Erreur lors de l'envoi de l'email" });
    }
    console.log("Email envoyé avec succès :", info.response);
    return res.status(200).send({
      success: true,
      message:
        "Email envoyé avec succès! Nous vous contacterons prochainement!",
    });
  });
});
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
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback après l'authentification
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Créer un token JWT après l'authentification
    const token = jwt.sign(
      {
        userId: req.user.id_user,
      },
      jwtsecret,
      { expiresIn: "24h" }
    );

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
