const Categorie = require("../models/categorie");
const Service = require("../models/service");

const create_service = async (req, res) => {
  try {
    const { titre_service, description_service, id_categorie, prix_service } =
      req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file", success: false });
    }

    const filePath = `uploads/admin/service/${file.filename}`;

    const result = await Service.create({
      titre_service,
      description_service,
      photo_service: filePath,
      id_categorie: id_categorie,
      prix_service: prix_service,
    });

    return res.status(200).json({ succes: true, result });
  } catch (error) {
    console.log(err);
    return res.status(400).json({ error: "Error", success: false });
  }
};

const update_service = async (req, res) => {
  try {
    const { titre_service, description_service, id_categorie, prix_service } =
      req.body;
    const file = req.file;
    const id_service = req.params.id;
    if (!file) {
      return res.status(400).json({ error: "No file" });
    }

    const filePath = `uploads/admin/service/${file.filename}`;

    const result = await Service.update(
      {
        titre_service,
        description_service,
        photo_service: filePath,
        id_categorie: id_categorie,
        prix_service: prix_service,
      },
      { where: id_service }
    );

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error" });
  }
};

const delete_service = async (req, res) => {
  try {
    const id_service = req.params.id;
    const result = await Service.destroy({ where: { id_service } });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Error" });
  }
};

const get_service = async (req, res) => {
  try {
    const result = await Service.findAll();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Error" });
  }
};

const get_single_service = async (req, res) => {
  try {
    const id_service = req.params.id;

    // Fetch the Service along with its associated Categorie
    const result = await Service.findOne({
      where: { id_service },
      include: [
        {
          model: Categorie, // Include the Categorie model
          as: "categorie",
          attributes: ["nom_categorie", "description_categorie"], // Specify the Categorie fields you want
        },
      ],
    });

    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });

    return res.status(200).json({ success: true, service: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error fetching service" });
  }
};

module.exports = {
  create_service,
  get_service,
  update_service,
  delete_service,
  get_single_service,
};

//
