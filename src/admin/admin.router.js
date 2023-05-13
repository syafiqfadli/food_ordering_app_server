const express = require("express");
const adminRouter = express.Router();
const AdminService = require("./admin.service");

//GET
adminRouter.route("/admin/info").get(AdminService.getAdmin);
adminRouter.route("/admin/restaurant-list").get(AdminService.getAllRestaurant);
adminRouter.route("/admin/order").get(AdminService.getOrder);

//POST
adminRouter.route("/admin/create").post(AdminService.createAdmin);

//PATCH
adminRouter.route("/admin/update").patch(AdminService.updateAdmin);
adminRouter.route("/admin/add-restaurant").patch(AdminService.addRestaurant);
adminRouter.route("/admin/add-menu").patch(AdminService.addMenu);

//DELETE
adminRouter.route("/admin/delete").delete(AdminService.deleteAdmin);

module.exports = adminRouter;
