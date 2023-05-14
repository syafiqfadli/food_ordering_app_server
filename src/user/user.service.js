const uid = require("short-uuid");
const User = require("./user.schema");
const userObj = "User";

const ResponseEntity = require("../entities/response.entity");

class UserService {
  static getAllUsers = async (req, res) => {
    const users = await User.find({});

    return ResponseEntity.successfulResponse({ users }, res);
  };

  static getUser = async (req, res) => {
    const firebaseId = req.query.firebaseId;

    if (!firebaseId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOne({
      firebaseId: firebaseId,
    });

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return ResponseEntity.successfulResponse({ user }, res);
  };

  static createUser = async (req, res) => {
    const firebaseId = req.body.firebaseId;
    const email = req.body.email;
    const name = req.body.name;

    if (!firebaseId || !email || !name) {
      return ResponseEntity.errorNullResponse(res);
    }

    const userBody = {
      firebaseId: firebaseId,
      email: email,
      name: name,
      cart: [],
      order: [],
      history: [],
    };

    const user = await User.create(userBody);

    return ResponseEntity.successfulResponse({ user }, res);
  };

  static updateUser = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return ResponseEntity.successfulResponse({ user }, res);
  };

  static deleteUser = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOneAndDelete({
      email: email,
    });

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return res.json({
      isSuccess: true,
      message: `User with email ${email} has been deleted.`,
    });
  };

  static addToCart = async (req, res) => {
    const email = req.body.email;
    const cartId = uid.generate();
    const restaurantId = req.body.restaurantId;
    const order = {
      menu: req.body.menu,
      price: req.body.price,
      quantity: req.body.quantity,
    };

    let cart = {};

    if (
      !email ||
      !restaurantId ||
      !order.menu ||
      !order.price ||
      !order.quantity
    ) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    cart = await User.findOneAndUpdate(
      {
        "cart.restaurantId": restaurantId,
      },
      {
        $push: {
          "cart.$.menuList": order,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("cart");

    if (!cart) {
      cart = await User.findOneAndUpdate(
        {
          email: email,
        },
        {
          $push: {
            cart: {
              cartId: cartId,
              restaurantId: restaurantId,
              orderList: [order],
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("cart");
    }

    return ResponseEntity.successfulResponse({ cart }, res);
  };

  static checkoutOrder = async (req, res) => {
    const orderId = uid.generate();
    const cartId = req.body.cartId;

    if (!cartId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const order = await User.findOneAndUpdate(
      {
        "cart.cartId": cartId,
      },
      {
        $push: {
          order: {
            orderId: orderId,
          },
        },
        $pull: {
          cart: {
            cartId: cartId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("order");

    if (!order) {
      return ResponseEntity.errorNotFoundResponse("Cart", res);
    }

    return ResponseEntity.successfulResponse({ order }, res);
  };

  static getCart = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const cart = await User.findOne({
      email: email,
    }).select("cart");

    if (!cart) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return ResponseEntity.successfulResponse({ cart }, res);
  };
}

module.exports = UserService;
