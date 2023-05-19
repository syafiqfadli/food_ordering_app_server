const uid = require("short-uuid");
const User = require("./user.schema");
const userObj = "User";

const ResponseEntity = require("../entities/response.entity");

class UserService {
  static getAllUsers = async (req, res) => {
    const users = await User.find({});

    return ResponseEntity.dataResponse({ users }, res);
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

    return ResponseEntity.dataResponse(user, res);
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

    await User.create(userBody);

    return ResponseEntity.messageResponse("User created successfully.", res);
  };

  static addToCart = async (req, res) => {
    const firebaseId = req.body.firebaseId;
    const cartId = uid.generate();
    const restaurantId = req.body.restaurantId;
    const restaurantName = req.body.restaurantName;
    const price = req.body.price;
    const quantity = req.body.quantity;

    const order = {
      menuId: req.body.menuId,
      menuName: req.body.menuName,
      price: price,
      quantity: quantity,
    };

    let cart = {};

    if (
      !firebaseId ||
      !restaurantId ||
      !restaurantName ||
      !order.menuId ||
      !order.menuName ||
      !order.price ||
      !order.quantity
    ) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOne({
      firebaseId: firebaseId,
    });

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    const menuId = await User.findOneAndUpdate(
      {
        "cart.menuList.menuId": order.menuId,
      }, 
      {
        $inc: {
          "cart.$[].menuList.$[menuList].quantity": order.quantity,
        }
      },
      {
        "multi": false,
        "upsert": false,
        arrayFilters: [
          {
            "menuList.menuId": { $eq: order.menuId }
          }
        ]
      }
    )

    if (menuId) {
      return ResponseEntity.messageResponse("Updated cart successfully.", res);
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
    );

    if (!cart) {
      cart = await User.findOneAndUpdate(
        {
          firebaseId: firebaseId,
        },
        {
          $push: {
            cart: {
              cartId: cartId,
              restaurantId: restaurantId,
              restaurantName: restaurantName,
              menuList: [order],
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return ResponseEntity.messageResponse("Added to cart successfully.", res);
  };

  static checkoutOrder = async (req, res) => {
    const orderId = uid.generate();
    const cartId = req.body.cartId;

    if (!cartId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const cart = await User.aggregate([
      {
        $unwind: "$cart",
      },
      {
        $match: {
          "cart.cartId": cartId,
        },
      },
      {
        $project: {
          _id: 0,
          restaurantId: "$cart.restaurantId",
          restaurantName: "$cart.restaurantName",
          menuList: "$cart.menuList",
        },
      },
    ]);

    if (cart.length === 0) {
      return ResponseEntity.errorNotFoundResponse("Cart", res);
    }

    await User.findOneAndUpdate(
      {
        "cart.cartId": cartId,
      },
      {
        $push: {
          order: {
            orderId: orderId,
            restaurantId: cart[0].restaurantId,
            restaurantName: cart[0].restaurantName,
            status: "In the kitchen",
            orderList: cart[0].menuList,
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
    );

    return ResponseEntity.messageResponse("Checked out successfully.", res);
  };

  static deleteCart = async (req, res) => {
    const cartId = req.body.cartId;

    if (!cartId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const cart = await User.findOneAndUpdate(
      {
        "cart.cartId": cartId,
      },
      {
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
    );

    if (!cart) {
      return ResponseEntity.errorNotFoundResponse("Cart", res);
    }

    return ResponseEntity.messageResponse("Deleted cart successfully.", res);
  };

  static deleteMenu = async (req, res) => {
    const cartId = req.body.cartId;
    const menuId = req.body.menuId;

    if (!cartId || !menuId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const menu = await User.findOneAndUpdate(
      {
        "cart.cartId": cartId,
        "cart.menuList.menuId": menuId,
      },
      {
        $pull: {
          "cart.$.menuList": {
            menuId: menuId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!menu) {
      return ResponseEntity.errorNotFoundResponse("Menu", res);
    }

    return ResponseEntity.messageResponse(
      "Deleted menu in cart successfully.",
      res
    );
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

    return ResponseEntity.messageResponse(
      `User with email ${email} has been deleted.`,
      res
    );
  };
}

module.exports = UserService;
