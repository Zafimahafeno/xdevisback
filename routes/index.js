const express = require("express");
const multer = require("multer");

const {
  change_password_admin,
  authenticationAdmin,
  create_admin,
  get_admin,
} = require("../controller/admincontroller");

const path = require("path");
const fs = require("fs");
const {
  create_agent,
  update_agent,
  delete_agent,
  get_agent,
  get_single_agent,
  approuver_refuser,
  get_agent_disponible,
} = require("../controller/agentcontroller");
const {
  get_demand,
  validate_demand,
  unvalidate_demand,
  update_demande,
  create_demand,
  delete_demand,
  get_non_valid_demand,
  get_demande_user,
} = require("../controller/projectcontroller");
const {
  create_service,
  update_service,
  delete_service,
  get_service,
  get_single_service,
} = require("../controller/servicecontroller");
const {
  create_user,
  get_user,
  update_user,
  delete_user,
  authenticationUser,
  change_password_user,
  change_contact,
  mot_de_passe_oublie,
} = require("../controller/usercontroller");
const {
  create_task,
  get_tasks,
  get_tasks_by_agent,
  update_task_status,
  delete_task,
} = require("../controller/tachecontroller");

const {
  createCategorie,
  getCategories,
  deleteCategorie,
  getCategorieById,
  get_services_categorie,
  updateCategorie,
} = require("../controller/categoriecontroller");
const createTestData = require("../controller/defaultdata");
const {
  set_read_notif,
  get_notification_admin,
  get_notification_user,
  count_notif_user,
  count_notif_admin,
  delete_notif,
} = require("../controller/notificationcontroller");

//=====================================storage=====================================//
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadFolder = "uploads/admin"; //par defaut
    if (
      req.originalUrl.includes("/create-agent") ||
      req.originalUrl.includes("/update-agent")
    ) {
      uploadFolder = "uploads/admin/agents";
    } else if (
      req.originalUrl.includes("/create-service") ||
      req.originalUrl.includes("/update-service")
    ) {
      uploadFolder = "uploads/admin/services";
    } else if (
      req.originalUrl.includes("/create-user") ||
      req.originalUrl.includes("/update-user")
    ) {
      uploadFolder = "uploads/clients/";
    }

    const uploadPath = path.join(__dirname, "../", uploadFolder);

    // Ensure the folder exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // set the destination folder dynamically
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

// Multer middleware
// Multer middleware
const uploads = multer({ storage: storage }); // Retirez le .single ici



const router = express.Router();

router.post("/change-password", change_password_admin);
router.post("/login-admin", authenticationAdmin);
router.post("/create-admin", create_admin);
router.post("/get-admin", get_admin);

// agent

router.post("/create-agent/", uploads.single("image"), create_agent);
router.get("/get-agent/", get_agent);
router.get("/get-agent-disponible/", get_agent_disponible);
router.post("/update-agent/:id", uploads.single("image"), update_agent);
router.post("/delete-agent/:id", delete_agent);
router.get("/get-single-agent/:id", get_single_agent);
router.post("/approuver-refuser/:id", approuver_refuser);

// demande

router.get("/get-demande/", get_demand);
router.get("/get-demande-user/:id", get_demande_user);
router.get("/get-non-valid-demande/", get_non_valid_demand);
router.post("/valide-demande/:id", validate_demand);
router.post("/unvalide-demande/:id", unvalidate_demand);
router.post("/update-demande/:id", update_demande);
router.post("/create-demande/", create_demand);
router.post("/delete-demande/:id", delete_demand);

//service

router.post("/create-service", uploads.single("image"), create_service);
router.get("/get-services/", get_service);
router.get("/get-single-service/:id", get_single_service);
router.post("/update-service/:id", uploads.single("image"), update_service);
router.post("/delete-service/:id", delete_service);

//user

router.post("/create-user", uploads.single("photo_user"), create_user);
router.get("/get-user/", get_user);
router.post("/update-user/:id", uploads.single("photo_user"), update_user);
router.post("/delete-user/:id", delete_user);
router.post("/change-contact/:id", change_contact);
router.post("/login-user", authenticationUser);
router.post("/change-password-user", change_password_user);
router.post("/reset-password", mot_de_passe_oublie);

//tache

router.post("/create-task", create_task);
router.get("/get-tasks", get_tasks);
router.get("/get-tasks-by-agent/:id_agent", get_tasks_by_agent);
router.post("/update-task-status/:id", update_task_status);
router.post("/delete-task/:id", delete_task);

// categorie

router.post("/create-categorie", createCategorie);
router.post("/update-categorie/:id", updateCategorie);
router.post("/delete-categorie/:id", deleteCategorie);
router.get("/get-categories", getCategories);
router.get("/get-single-categorie/:id", getCategorieById);
router.get("/get-service-categorie/:id", get_services_categorie);

//notification
router.post("/set-read-notif/:id", set_read_notif);
router.get("/get-notif-admin", get_notification_admin);
router.get("/get-notif-user/:id", get_notification_user);
router.get("/get-count-notif-user/:id", count_notif_user);
router.get("/get-count-notif-admin/", count_notif_admin);
router.post("/delete-notif/:id", delete_notif);

router.post("/default-data", createTestData);

module.exports = router;
