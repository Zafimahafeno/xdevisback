const { Op } = require("sequelize");
const Notification = require("../models/notification");

const get_notification_admin = async (req, res) => {
  try {
    const notif = await Notification.findAll({
      where: {
        creator: "user",
      },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ success: true, notif });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ erreur: error, success: false });
  }
};
const get_notification_user = async (req, res) => {
  try {
    const id_user = req.params.id;
    const notif = await Notification.findAll({
      where: {
        creator: "admin",
        id_user: id_user,
      },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ success: true, notif });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ erreur: error, success: false });
  }
};

const set_read_notif = async (req, res) => {
  try {
    const id_notif = req.params.id;
    const result = await Notification.update(
      { is_read: 1 },
      { where: { id_notif } }
    );
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ erreur: error, success: false });
  }
};

const count_notif_admin = async (req, res) => {
  try {
    const result = await Notification.findAll({
      where: {
        is_read: 0,
        creator: "user",
      },
    });
    res.status(200).json({ success: true, result: result.length });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error, success: false });
  }
};
const count_notif_user = async (req, res) => {
  try {
    const id_user = req.params.id;
    const result = await Notification.findAll({
      where: {
        id_user: id_user,
        creator: "admin",
        is_read: 0,
      },
    });
    res.status(200).json({ success: true, result: result.length });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error, success: false });
  }
};

const delete_notif = async (req, res) => {
  try {
    const id_notif = req.params.id;
    const result = await Notification.destroy({ where: { id_notif } });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ erreur: error, success: false });
  }
};

module.exports = {
  get_notification_admin,
  get_notification_user,
  set_read_notif,
  count_notif_admin,
  count_notif_user,
  delete_notif,
};
