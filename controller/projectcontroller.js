const Projet = require("../models/projet"); //
const User = require("../models/user");
const { Op } = require("sequelize"); // Import Op from sequelize
const nodemailer = require("nodemailer");
const Media = require("../models/media");
const Rendezvous = require("../models/rendezvous");
const { parseISO, format } = require("date-fns");
const { fr } = require("date-fns/locale");
// Obtenir toutes les projet
const get_projet = async (req, res) => {
  try {
    const result = await Projet.findAll({
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Media,
          as: "media",
        },
      ],
      where: { is_brouillon: 0 },

      order: [["updatedAt", "DESC"]],
    });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

const get_projet_per_user = async (req, res) => {
  try {
    const id_user = req.params.id;
    const result = await Projet.findAll({
      where: { id_user, is_brouillon: 0 },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Media,
          as: "media",
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};
// const create_projet = async (req, res) => {
//   try {
//     const {
//       id_user,
//       description_projet,
//       objet_projet,
//       rendezvous,
//       is_brouillon,
//     } = req.body;
//     console.log(id_user, description_projet, objet_projet, is_brouillon);

//     // Prepare schema for the Projet model
//     const schema = {
//       id_user,
//       description_projet,
//       objet_projet,
//       rendezvous: rendezvous || null, // Set rendezvous only if provided
//       is_brouillon,
//     };

//     // Create the project record
//     const result = await Projet.create(schema);

//     // Process uploaded media files
//     if (req.files && req.files.length > 0) {
//       // Map through the uploaded files and create media records
//       const mediaPromises = req.files.map((file) => {
//         return Media.create({
//           uri: `uploads/projet/${file.filename}`, // Store the path of the file
//           id_projet: result.id_projet, // Associate with the newly created project
//         });
//       });

//       // Wait for all media records to be created
//       await Promise.all(mediaPromises);
//     }

//     if (is_brouillon === 0) {
//       // Email setup
//       // Créer un transporteur pour envoyer l'email via GoDaddy
//       const transporter = nodemailer.createTransport({
//         host: "smtp.office365.com",
//         port: 587, // Ou 587 si vous choisissez TLS
//         secure: false, // true pour 465, false pour 587
//         auth: {
//           user: "App@xdevis.com", // Remplacez par votre adresse email professionnelle
//           pass: "madamada24", // Remplacez par votre mot de passe
//         },
//       });

//       // Create attachments array from the uploaded files
//       const attachments = req.files.map((file) => ({
//         filename: file.originalname, // Use the original name of the file
//         path: `uploads/projet/${file.filename}`, // Path to the file to be attached
//       }));

//       // Email configuration
//       const mail_configs = {
//         from: "App@xdevis.com", // Remplacez par votre adresse email
//         to: "App@xdevis.com", // Remplacez par l'adresse du destinataire

//         subject: "Nouveau projet soumis pour CONSULTIZE",
//         html: `
//         <h1 style="color:#007AFF;">Nouveau Projet Soumis</h1>
//         <p><strong>Objet du projet :</strong> ${objet_projet}</p>
//         <p><strong>Description du projet :</strong></p>
//         <p style="color:#333;">${description_projet}</p>
//         <p><strong>Date du rendez-vous :</strong> ${
//           rendezvous ? rendezvous : "Non précisée"
//         }</p>
//       `,
//         attachments, // Attach the files here
//       };

//       // Send email with attachments
//       transporter.sendMail(mail_configs, function (error, info) {
//         if (error) {
//           console.log("Erreur lors de l'envoi de l'email :", error);
//           return res
//             .status(500)
//             .send({ message: "Erreur lors de l'envoi de l'email" });
//         }
//         console.log("Email envoyé avec succès :", info.response);
//       });
//       return res.status(200).json({ success: true, result });
//     }
//     return res.status(200).json({ success: true, result });
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({ success: false, error: err.message });
//   }
// };
function formatDateUTC(date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

const create_projet = async (req, res) => {
  try {
    const {
      id_user,
      description_projet,
      objet_projet,
      rendezvous,
      is_brouillon,
    } = req.body;
    console.log(id_user, description_projet, objet_projet, is_brouillon);
    // Format the rendezvous date
    let formattedRendezvous = "Non précisée"; // Default value
    if (rendezvous) {
      const date = new Date(rendezvous);
      formattedRendezvous = formatDateUTC(date); // Format to your desired forma
      console.log(formattedRendezvous);
    }
    const user = await User.findOne({ where: { id_user } });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur introuvable" });
    }
    const schema = {
      id_user,
      description_projet,
      objet_projet,
      rendezvous: rendezvous || null,
      is_brouillon,
    };

    const result = await Projet.create(schema);

    // Traiter les fichiers médias téléchargés
    if (req.files && req.files.length > 0) {
      const mediaPromises = req.files.map((file) => {
        return Media.create({
          uri: `uploads/projet/${file.filename}`,
          id_projet: result.id_projet,
        });
      });
      await Promise.all(mediaPromises);
    }

    if (is_brouillon == 0) {
      // Créer un transporteur pour envoyer l'email via Zoho
      console.log(user.email_user, is_brouillon);

      const attachments =
        req.files && req.files.length > 0
          ? req.files.map((file) => ({
              filename: file.originalname,
              path: `uploads/projet/${file.filename}`,
            }))
          : [];

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
        from: user.email_user,
        to: "App@xdevis.com",
        subject: "Nouveau projet soumis pour CONSULTIZE",
        html: `
        <h1 style="color:#007AFF;">Nouveau Projet Soumis</h1>
        <p><strong>Objet du projet :</strong> ${objet_projet}</p>
        <p><strong>Description du projet :</strong></p>
        <p style="color:#333;">${description_projet}</p>
        <p><strong>Date du rendez-vous :</strong> ${formattedRendezvous}</p>
      `,
        attachments,
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
      return res.status(200).json({ success: true, result });
    }
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};
const get_single_brouillon = async (req, res) => {
  try {
    const id_projet = req.params.id;
    const result = await Projet.findOne({
      where: { id_projet },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Media,
          as: "media",
        },
      ],
    });
    if (!result)
      return res
        .status(400)
        .json({ success: false, message: "Projet non trouvé" });
    return res.status(200).json({ result, success: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};
const delete_media = async (req, res) => {
  try {
    const id_media = req.params.id;
    const result = await Media.destroy({ where: { id_media } });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

const get_projet_per_user_with_rendezvous = async (req, res) => {
  try {
    const id_user = req.params.id;
    const projet = await Projet.findAll({
      where: {
        id_user,
        rendezvous: {
          [Op.ne]: null, // Check for non-null values
        },
        is_brouillon: 0,
      },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Media,
          as: "media",
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    const rdv = await Rendezvous.findAll({ where: { id_user } });

    const result = [...projet, ...rdv];
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};
// Obtenir toutes les projet
const get_brouillon = async (req, res) => {
  try {
    const result = await Projet.findAll({
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Media,
          as: "media",
        },
      ],
      where: { is_brouillon: 1 },

      order: [["updatedAt", "DESC"]],
    });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

const get_brouillon_per_user = async (req, res) => {
  try {
    const id_user = req.params.id;
    const result = await Projet.findAll({
      where: { id_user, is_brouillon: 1 },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Media,
          as: "media",
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    console.log("Brouillon");
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};
// Supprimer une projet
const delete_projet = async (req, res) => {
  try {
    const id_projet = req.params.id;

    const result = await Projet.destroy({ where: { id_projet } });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};
// Mettre à jour une projet existante

const create_projet_after_brouillon = async (req, res) => {
  try {
    const id_projet = req.params.id;
    const {
      description_projet,
      id_user,
      objet_projet,
      rendezvous,
      is_brouillon,
    } = req.body;
    const user = await User.findOne({ where: { id_user } });
    let formattedRendezvous = "Non précisée"; // Default value
    if (rendezvous) {
      const date = new Date(rendezvous);
      formattedRendezvous = formatDateUTC(date); // Format to your desired forma
      console.log(formattedRendezvous);
    }
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur introuvable" });
    }
    const schema = {
      id_user,
      description_projet,
      objet_projet,
      rendezvous: rendezvous || null,
      is_brouillon,
    };

    const result = await Projet.update(schema, { where: { id_projet } });

    // Traiter les fichiers médias téléchargés
    if (req.files && req.files.length > 0) {
      const mediaPromises = req.files.map((file) => {
        return Media.create({
          uri: `uploads/projet/${file.filename}`,
          id_projet: result.id_projet,
        });
      });
      await Promise.all(mediaPromises);
    }

    if (is_brouillon == 0) {
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

      const attachments = req.files.map((file) => ({
        filename: file.originalname,
        path: `uploads/projet/${file.filename}`,
      }));

      const mail_configs = {
        from: user.email_user,
        to: "App@xdevis.com",
        subject: "Nouveau projet soumis pour CONSULTIZE",
        html: `
        <h1 style="color:#007AFF;">Nouveau Projet Soumis</h1>
        <p><strong>Objet du projet :</strong> ${objet_projet}</p>
        <p><strong>Description du projet :</strong></p>
        <p style="color:#333;">${description_projet}</p>
        <p><strong>Date du rendez-vous :</strong> ${formattedRendezvous}</p>
      `,
        attachments,
      };

      console.log("Envoi de l'email...");
      transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log("Erreur lors de l'envoi de l'email :", error);
          return res
            .status(500)
            .send({ message: "Erreur lors de l'envoi de l'email" });
        }
        console.log("Email envoyé avec succès :", info.response);
      });
      return res.status(200).json({ success: true, result });
    }
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = {
  get_projet,
  create_projet,
  delete_projet,
  get_projet_per_user,
  get_projet_per_user_with_rendezvous,
  get_brouillon_per_user,
  get_brouillon,
  get_single_brouillon,
  delete_media,
  create_projet_after_brouillon,
};
