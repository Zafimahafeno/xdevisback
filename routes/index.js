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
  get_projet,
  create_projet,
  delete_projet,
  get_projet_per_user,
  get_projet_per_user_with_rendezvous,
  get_brouillon,
  get_brouillon_per_user,
  get_single_brouillon,
  delete_media,
  create_projet_after_brouillon,
} = require("../controller/projectcontroller");
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

//=====================================storage=====================================//
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadFolder = "uploads/admin"; //par defaut
    if (
      req.originalUrl.includes("/create-projet") ||
      req.originalUrl.includes("/update-projet")
    ) {
      uploadFolder = "uploads/projet";
    } else if (
      req.originalUrl.includes("/create-user") ||
      req.originalUrl.includes("/update-user")
    ) {
      uploadFolder = "uploads/user";
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

// projet

router.get("/get-projet/", get_projet);
router.get("/get-brouillon/", get_brouillon);
router.get("/get-single-brouillon/:id", get_single_brouillon);
router.get("/get-projet-per-user/:id", get_projet_per_user);
router.get("/get-brouillon-per-user/:id", get_brouillon_per_user);
router.get(
  "/get-projet-per-user-with-rendezvous/:id",
  get_projet_per_user_with_rendezvous
);
// array of project instead of project itself
router.post("/create-projet", uploads.array("photo_projet", 5), create_projet);
router.post("/create-projet-after-brouillon/:id", uploads.array("photo_projet", 5), create_projet_after_brouillon);

router.post("/delete-projet/:id", delete_projet);
router.post("/delete-media/:id", delete_media);

//user

router.post("/create-user", uploads.single("photo_user"), create_user);
router.get("/get-user/", get_user);
router.post("/update-user/:id", uploads.single("photo_user"), update_user);
router.post("/delete-user/:id", delete_user);
router.post("/change-contact/:id", change_contact);
router.post("/login-user", authenticationUser);
router.post("/change-password-user", change_password_user);
router.post("/reset-password", mot_de_passe_oublie);

module.exports = router;
