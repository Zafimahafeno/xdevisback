const Demande = require("../models/demande");
const Tache = require("../models/tache");
const Agent = require("../models/agent"); // Importer le modèle Agent pour la validation
const Service = require("../models/service");
const sequelize = require("../config/database");
const Notification = require("../models/notification");
const User = require("../models/user");

// Valider une demande et créer une tâche si elle est valide
const validate_demand = async (req, res) => {
  try {
    const id_demande = req.params.id;

    // Récupérer la demande validée
    const demande = await Demande.findOne({ where: { id_demande } });
    console.log("Demandededededede", demande.description_demande);
    if (!demande) {
      return res
        .status(404)
        .json({ success: false, error: "Demande non trouvée" });
    }
    await Demande.update({ status: "accepté" }, { where: { id_demande } });
    // const demand = await Demande.findOne({ where: { id_demande } });
    const notif = await Notification.create({
      value_notif: `Votre demande ' ${demande.description_demande} ' a  été accepté par l'administrateur `,
      creator: "admin",
      id_user: demande.id_user,
    });
    console.log("Notification created is", notif.id_notif);
    return res.status(200).json({ success: true, notif: notif.id_notif });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
};

// Annuler la validation d'une demande
const unvalidate_demand = async (req, res) => {
  try {
    const id_demande = req.params.id;

    const result = await Demande.update(
      { valide_demande: "decliné" },
      { where: { id_demande } }
    );

    // Optionnellement, supprimer les tâches associées à cette demande lorsqu'elle est annulée

    const demande = await Demande.findOne({ where: { id_demande } });
    await Notification.create({
      value_notif: `Votre demande a malheureusement été décliné `,
      creator: "admin",
      id_user: demande.id_user,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

// Obtenir toutes les demandes
const get_demand = async (req, res) => {
  try {
    const result = await Demande.findAll({
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["titre_service", "description_service"],
        },
        {
          model: Tache,
          as: "taches",
          attributes: ["id_tache", "description_tache"],
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
const get_demande_user = async (req, res) => {
  try {
    const id_user = req.params.id;

    const result = await sequelize.query(
      "SELECT `Demande`.`id_demande`, `Demande`.`id_user`, `Demande`.`id_service`, `Demande`.`date_demande`, `Demande`.`description_demande`, `Demande`.`statut_paiment`, `Demande`.`status`, `Demande`.`numero_joignable`, `Demande`.`createdAt`, `Demande`.`updatedAt`, `service`.`titre_service` AS `service.titre_service`, `service`.`description_service` AS `service.description_service`, `service`.`id_service` AS `service.id_service` FROM `demande` AS `Demande` LEFT OUTER JOIN `service` AS `service` ON `Demande`.`id_service` = `service`.`id_service` WHERE `Demande`.`id_user`= ?  ORDER BY `Demande`.`updatedAt` DESC; ",
      { replacements: [id_user], type: sequelize.QueryTypes.SELECT }
    );
    // console.log("result", result);

    const formatedResult = result.map((data) => ({
      id_demande: data.id_demande,
      id_user: data.id_user,
      id_service: data.id_service,
      date_demande: data.date_demande,
      description_demande: data.description_demande,
      statut_paiment: data.statut_paiement,
      status: data.status,
      numero_joignable: data.numero_joignable,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      service: {
        titre_service: data["service.titre_service"],
        description_service: data["service.description_service"],
      },
    }));
    return res.status(200).json({ success: true, result: formatedResult });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};
const get_non_valid_demand = async (req, res) => {
  try {
    const result = await Demande.findAll(
      { where: { status: "en_cours" } },
      {
        include: [{ model: Tache, as: "taches" }],
      }
    );
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

// Créer une nouvelle demande
const create_demand = async (req, res) => {
  try {
    const {
      id_user,
      id_service,
      date_demande,
      description_demande,
      numero_joignable,
    } = req.body;

    const result = await Demande.create({
      id_user,
      id_service,
      date_demande,
      description_demande,
      statut_paiement: 0,
      valide_demande: "en_cours",
      numero_joignable,
    });
    const service = await Service.findOne({ where: { id_service } });
    const user = await User.findOne({ where: { id_user } });
    await Notification.create({
      value_notif: `Une nouvelle demande de ${service.nom_service} par ${user.nom_user}`,
      creator: "user",
      id_user: id_user,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

// Supprimer une demande
const delete_demand = async (req, res) => {
  try {
    const id_demande = req.params.id;

    const result = await Demande.destroy({ where: { id_demande } });

    // Optionnellement, supprimer les tâches associées
    await Tache.destroy({ where: { id_demande } });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

// Mettre à jour une demande existante
const update_demande = async (req, res) => {
  try {
    const {
      id_user,
      id_service,
      date_demande,
      description_demande,
      statut_paiement,
      valide_demande,
    } = req.body;

    const id_demande = req.params.id;

    const result = await Demande.update(
      {
        id_user,
        id_service,
        date_demande,
        description_demande,
        statut_paiement,
        valide_demande,
      },
      { where: { id_demande } }
    );

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
};

module.exports = {
  validate_demand,
  unvalidate_demand,
  get_demand,
  create_demand,
  delete_demand,
  update_demande,
  get_non_valid_demand,
  get_demande_user,
};
