const User = require("../models/user");
const Tache = require("../models/tache");
const Service = require("../models/service");
const Categorie = require("../models/categorie");
const Demande = require("../models/demande");
const Agent = require("../models/agent");
const TacheAgent = require("../models/tacheagent");
const bcrypt = require("bcrypt");
const Notification = require("../models/notification");
const createTestData = async (req, res) => {
  try {
    // Ensure the database is synchronized

    // Create default categories
    const cat1 = await Categorie.create({
      nom_categorie: "Auto",
      description_categorie: "On peut s'occuper de vos auto en un instant",
    });
    const cat2 = await Categorie.create({
      nom_categorie: "Enfant",
      description_categorie: "Des services pour des enfants",
    });

    // Create default services
    const svc1 = await Service.create({
      id_categorie: cat1.id_categorie,
      titre_service: "Chauffeur",
      description_service:
        "Conduite de véhicule des personnes en cas d'invalidité temporaire",
      photo_service: "uploads/admin/services/1726130685846.jpg",
      prix_service: 5000,
    });
    const svc2 = await Service.create({
      id_categorie: cat2.id_categorie,
      titre_service: "Service 2",
      description_service: "Collecte et livraison à domicile de linge repassé",
      photo_service: "uploads/admin/services/1726130685846.jpg",
      prix_service: 8000,
    });

    const saltRounds = 10;

    const hashedPass = await bcrypt.hash("password", saltRounds);
    // Create default users
    const user1 = await User.create({
      nom_user: "Manjaka",
      prenom_user: "Hasina",
      contact_user: "0341011952",
      adresse_user: "123 Main St",
      email: "admin@example.com",
      photo_user: "uploads/clients/1726131178760.jpg",
      genre_user: "M",
      password_user: hashedPass,
    });
    const user2 = await User.create({
      nom_user: "John",
      prenom_user: "Doe",
      contact_user: "0341011952",
      adresse_user: "456 Elm St",
      email: "john@gmail.com",
      photo_user: "uploads/clients/1726131178760.jpg",
      genre_user: "M",
      password_user: hashedPass,
    });

    // Create default agents
    const agent1 = await Agent.create({
      nom_agent: "John",
      prenom_agent: "Doe",
      photo_agent: "uploads/admin/agents/1726044676891.jpg",
      contact_agent: "0341011952",
      adresse_agent: "123 Main St",
      status: "disponible",
    });
    const agent2 = await Agent.create({
      nom_agent: "Jane",
      prenom_agent: "Smith",
      photo_agent: "uploads/admin/agents/1726044676891.jpg",
      contact_agent: "0341011952",
      adresse_agent: "456 Elm St",
      status: "disponible",
    });

    // Create default demands
    const demande1 = await Demande.create({
      id_user: user1.id_user,
      id_service: svc1.id_service,
      date_demande: new Date(),
      description_demande: "Demand 1 description",
      statut_paiment: "paye",
      status: "en_cours",
      numero_joignable: user1.contact_user,
    });
    const demande2 = await Demande.create({
      id_user: user2.id_user,
      id_service: svc2.id_service,
      date_demande: new Date(),
      description_demande: "Demand 2 description",
      statut_paiment: "non payé",
      status: "accepté",
      numero_joignable: user2.contact_user,
    });
    // Create default tasks
    // const task1 = await Tache.create({
    //   id_user: user1.id_user,
    //   id_service: svc1.id_service,
    //   date_tache: new Date(),
    //   description_tache: "Task 1 description",
    //   status_tache: "en_cours",
    //   id_demande: demande1.id_demande,
    // });

    // Create default relationships between tasks and agents (many-to-many) via TacheAgent
    // await TacheAgent.create({
    //   id_tache: task1.id_tache,
    //   id_agent: agent1.id_agent,
    // });
    // await TacheAgent.create({
    //   id_tache: task1.id_tache,
    //   id_agent: agent2.id_agent,
    // });

    console.log("Default test data inserted successfully.");
    return res.status(200).json({ success: true, message: "Oui inserer" });
  } catch (error) {
    console.error("Error inserting default data:", error);
    return res.status(400).json({ error: error });
  }
};

module.exports = createTestData;
