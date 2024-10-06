const Tache = require("../models/tache");
const Agent = require("../models/agent");
const Demande = require("../models/demande");
const Service = require("../models/service");
const TacheAgent = require("../models/tacheagent");

// Obtenir toutes les tâches
const get_tasks = async (req, res) => {
  try {
    const tasks = await Tache.findAll({
      include: [
        { model: Agent, as: "agents" },
        { model: Demande, as: "demande" },
        { model: Service, as: "service" },
      ],
    });
    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message, success: false });
  }
};

// Obtenir les tâches d'un agent spécifique
const get_tasks_by_agent = async (req, res) => {
  try {
    const id_agent = req.params.id_agent;
    const tasks = await Tache.findAll({
      where: { id_agent },
      include: [
        { model: Agent, as: "agents" },
        { model: Demande, as: "demande" },
      ],
    });

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Aucune tâche trouvée pour cet agent" });
    }

    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message, success: false });
  }
};

// creer tache
const create_task = async (req, res) => {
  try {
    const {
      id_user,
      id_service,
      date_tache,
      id_demande,
      description_tache,
      id_agent,
    } = req.body;

    if (!Array.isArray(id_agent) || id_agent.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No agents provided." });
    }

    // Créer la tâche
    const task = await Tache.create({
      id_user,
      id_service,
      date_tache,
      id_demande,
      description_tache,
      status_tache: "en_cours",
    });

    // Ajouter les agents à la tâche
    // await task.addAgents(id_agent); // Ajoute les agents à la tâche
    id_agent.forEach(async (element) => {
      await TacheAgent.create({
        id_tache: task.id_tache,
        id_agent: element,
      });
    });
    // Mettre à jour les agents à "au travail"
    await Agent.update(
      { status: "indisponible" },
      { where: { id_agent: id_agent } }
    );

    return res.status(200).json({ success: true, task });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err, success: false });
  }
};

// Mettre à jour le statut de la tâche (par exemple, en cours, complétée)
const update_task_status = async (req, res) => {
  try {
    const id_tache = req.params.id;
    const { status_tache } = req.body; // Le nouveau statut de la tâche

    const [updated] = await Tache.update(
      { status_tache },
      { where: { id_tache } }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Tâche non trouvée" });
    }
    const agents = await TacheAgent.findAll({ where: { id_tache } });

    agents.forEach(async (element) => {
      // console.log(element);
      await Agent.update(
        { status: "disponible" },
        { where: { id_agent: element.id_agent } }
      );
    });

    return res
      .status(200)
      .json({ success: true, message: "Statut de la tâche mis à jour" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err, success: false });
  }
};

// Supprimer une tâche
const delete_task = async (req, res) => {
  try {
    const id_tache = req.params.id;

    const result = await Tache.destroy({ where: { id_tache } });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, error: "Tâche non trouvée" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Tâche supprimée avec succès" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message, success: false });
  }
};

module.exports = {
  get_tasks,
  get_tasks_by_agent,
  create_task,
  update_task_status,
  delete_task,
};
