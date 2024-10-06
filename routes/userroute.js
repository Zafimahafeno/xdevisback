const express = require('express');
const router = express.Router();
const {
  create_user,
  get_user,
  update_user,
  delete_user,
  change_contact,
  authenticationUser,
  change_password_user,
  mot_de_passe_oublie
} = require('../controller/usercontroller'); // Vérifiez le chemin ici

// Vérifiez si les fonctions sont définies
console.log(create_user, get_user, update_user, delete_user, change_contact, authenticationUser, change_password_user, mot_de_passe_oublie);

router.post("/create-user", create_user);
router.get("/get-user/", get_user);
router.post("/update-user/:id", update_user);
router.post("/delete-user/:id", delete_user);
router.post("/change-contact/:id", change_contact);
router.post("/login-user", authenticationUser);
router.post("/change-password-user", change_password_user);
router.post("/reset-password", mot_de_passe_oublie);

module.exports = router;
