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
const socketIo = require("socket.io"); // Assurez-vous d'importer socket.io ici

// Initialisation de l'application
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Configuration de multer pour gérer l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Renommer le fichier
  }
});
const upload = multer({ storage: storage }); // Utilisez multer avec la configuration définie

// Routes
const admin = require("./routes");
const userRoutes = require("./routes/userroute");
const demandeRoutes = require("./routes");
app.use("/api/user", admin);
app.use("/api/demande", demandeRoutes);
app.use("/api/user", userRoutes);

// Créer le serveur HTTP
const server = http.createServer(app);

// Route pour envoyer l'email
app.post('/send-email', upload.single('photo_projet'), (req, res) => {
  console.log(req.file);  // Vérifiez si le fichier est bien reçu
  const { description_projet, rendezvous } = req.body;
  if (!req.file) {
    return res.status(400).send({ message: "Aucun fichier reçu." });
  }

  const photo_projet = req.file.path; // Chemin du fichier téléchargé

  // Créer un transporteur pour envoyer l'email via Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zanajaona2404@gmail.com',
      pass: 'rwhs wjqp lexx rftu',
    },
  });

  // Configuration de l'email
  const mail_configs = {
    from: 'zanajaona2404@gmail.com',
    to: 'zanajaona2404@gmail.com',
    subject: 'Nouveau projet soumis',
    text: `Description du projet : ${description_projet}\nRendez-vous : ${rendezvous}`,
    attachments: [
      {
        path: photo_projet, // Attacher le fichier téléchargé
      },
    ],
  };

  // Envoyer l'email
  transporter.sendMail(mail_configs, function (error, info) {
    if (error) {
      console.log("Erreur lors de l'envoi de l'email :", error);
      return res.status(500).send({ message: 'Erreur lors de l\'envoi de l\'email' });
    }
    console.log('Email envoyé avec succès :', info.response);
    return res.status(200).send({ message: 'Email envoyé avec succès' });
  });
});


const io = socketIo(server, {
  cors: {
    origin: [
      
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:8082",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", async (socket) => {
  socket.emit("Hey", "Doughlas");
  console.log("Djoulax");

  socket.on("countNotif", async (id_user) => {
    await calculateNotificationCount({ socket: socket, id_user: id_user });
  });
  
  socket.on("getNotificationUser", async ({ id_user, id_notif }) => {
    console.log("executing getnotificationuser");
    await get_single_notification_user({
      socket: socket,
      id_user: id_user,
      id_notif: id_notif,
    });
  });
});

async function calculateNotificationCount({ socket, id_user }) {
  try {
    const result = await Notification.findAll({
      where: {
        id_user: id_user,
        creator: "admin",
        is_read: 0,
      },
    });
    socket.emit("notifcount" + id_user, result.length);
  } catch (error) {
    console.log(error);
  }
}

async function get_single_notification_user({ socket, id_user, id_notif }) {
  try {
    const notif = await Notification.findOne({
      where: {
        id_notif,
      },
    });
    socket.emit(`notification${id_user}`, notif);
  } catch (error) {
    console.log(error);
  }
}


const Demande = require("./models/demande");
const User = require("./models/user");

// Associations

// Test Route
app.get("/", async (req, res) => {
  res.send("Hello");
});

// Sync Database
const syncDatabase = async () => {
  try {
    await sequelize.sync(); 
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
