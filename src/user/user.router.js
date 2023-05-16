const express = require("express");
const userRouter = express.Router();
const UserService = require("./user.service");

//GET
userRouter.route("/user/list").get(UserService.getAllUsers);
userRouter.route("/user/info").get(UserService.getUser);
// userRouter.route("/user/cart").get(UserService.getCart);
// userRouter.route("/user/order").get(UserService.getCart);
// userRouter.route("/user/history").get(UserService.getCart);

//POST
userRouter.route("/user/create").post(UserService.createUser);

//PATCH
// userRouter.route("/user/update").patch(UserService.updateUser);
userRouter.route("/user/add-to-cart").patch(UserService.addToCart);
userRouter.route("/user/checkout-order").patch(UserService.checkoutOrder);

//DELETE
userRouter.route("/user/delete").delete(UserService.deleteUser);

module.exports = userRouter;
