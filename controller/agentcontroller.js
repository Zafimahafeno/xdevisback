const Agent = require("../models/agent");
const Notification = require("../models/notification");

const create_agent = async (req, res) => {
  try {
    const { nom_agent, prenom_agent, contact_agent, adresse_agent, membre } =
      req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file" });
    }

    const filePath = `uploads/admin/agents/${file.filename}`;

    const alreadyExist = await Agent.findOne({ where: { contact_agent } });
    if (alreadyExist) {
      return res.status(400).json({
        success: false,
        error: "Le contact de l'agent est déjà dans la base de donnée",
      });
    }
    const result = await Agent.create({
      nom_agent,
      prenom_agent,
      photo_agent: filePath,
      contact_agent,
      adresse_agent,
      membre,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error" });
  }
};

const update_agent = async (req, res) => {
  try {
    const { nom_agent, prenom_agent, contact_agent, adresse_agent, status } =
      req.body;
    const id_agent = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file" });
    }

    const filePath = `uploads/admin/agents/${file.filename}`;

    const result = await Agent.update(
      {
        nom_agent,
        prenom_agent,
        photo_agent: filePath,
        contact_agent,
        adresse_agent,
        status,
      },
      { where: { id_agent } }
    );

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error" });
  }
};

const get_agent = async (req, res) => {
  try {
    const result = await Agent.findAll();
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err, success: false });
  }
};

const get_agent_disponible = async (req, res) => {
  try {
    const result = await Agent.findAll({
      where: { status: "disponible", membre: "approuvé" },
    });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err, success: false });
  }
};
const get_single_agent = async (req, res) => {
  try {
    const id_agent = req.params.id;
    const result = await Agent.findOne({ where: { id_agent } });
    if (!result) {
      return res
        .status(400)
        .json({ message: "Aucun agent trouvé", success: false });
    }
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error, success: false });
  }
};
const delete_agent = async (req, res) => {
  try {
    const id_agent = req.params.id;
    const result = await Agent.destroy({ where: { id_agent } });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
};

const approuver_refuser = async (req, res) => {
  try {
    const { membre } = req.body;
    const id_agent = req.params.id;
    const result = await Agent.findOne({ where: { id_agent } });
    if (!result) {
      return res
        .status(400)
        .json({ success: false, error: "Agent inexistant" });
    }
    await Agent.update({ membre: membre }, { where: { id_agent } });
    return res.status(200).json({ success: true, result: 1 });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ error: error, success: false });
  }
};

module.exports = {
  create_agent,
  update_agent,
  get_agent,
  delete_agent,
  get_single_agent,
  approuver_refuser,
  get_agent_disponible,
};
