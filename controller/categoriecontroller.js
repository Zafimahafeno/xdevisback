const Categorie = require("../models/categorie");
const Service = require("../models/service");

// Create Categorie
const createCategorie = async (req, res) => {
  try {
    const { nom_categorie, description_categorie } = req.body;

    // Create a new Categorie
    const newCategorie = await Categorie.create({
      nom_categorie,
      description_categorie,
    });

    return res.status(201).json({ success: true, categorie: newCategorie });
  } catch (error) {
    console.error("Error creating categorie:", error);
    return res.status(500).json({ error: "Failed to create categorie" });
  }
};

// Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Categorie.findAll();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get Single Categorie by ID
const getCategorieById = async (req, res) => {
  try {
    const { id } = req.params;
    const categorie = await Categorie.findByPk(id);

    return res.status(200).json({ success: true, categorie });
  } catch (error) {
    console.error("Error fetching categorie:", error);
    return res.status(500).json({ error: "Failed to fetch categorie" });
  }
};

// Update Categorie by ID
const updateCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_categorie, description_categorie } = req.body;

    const categorie = await Categorie.findByPk(id);

    categorie.nom_categorie = nom_categorie;
    categorie.description_categorie = description_categorie;

    // Save updated Categorie
    await categorie.save();

    return res.status(200).json({ success: true, categorie });
  } catch (error) {
    console.error("Error updating categorie:", error);
    return res.status(500).json({ error: "Failed to update categorie" });
  }
};

// Delete Categorie by ID
const deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await Categorie.findByPk(id);

    if (!categorie) {
      return res.status(404).json({ error: "Categorie not found" });
    }

    // Delete the Categorie
    await categorie.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Categorie deleted successfully" });
  } catch (error) {
    console.error("Error deleting categorie:", error);
    return res.status(500).json({ error: "Failed to delete categorie" });
  }
};

const get_services_categorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Find all services where id_categorie matches the provided ID
    const services = await Service.findAll({
      where: { id_categorie: id }, // Filter by category ID
      include: [
        {
          model: Categorie, // Include Categorie details
          as: "categorie", // Use the alias defined in the association
          attributes: ["nom_categorie", "description_categorie"], // Include specific fields from the Categorie model
        },
      ],
    });

    return res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("Error fetching services for category:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching services.",
    });
  }
};
module.exports = {
  createCategorie,
  getCategories,
  getCategorieById,
  updateCategorie,
  deleteCategorie,
  get_services_categorie,
};
