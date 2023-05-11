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
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return ResponseEntity.successfulResponse({ user }, res);
  };

  static createUser = async (req, res) => {
    if (!req.body.firebaseId || !req.body.email || !req.body.name) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.create(req.body);

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
    const restaurantId = req.body.restaurantId;

    if (!email || !restaurantId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        $push: {
          cart: {
            restaurantId: restaurantId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("cart");

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return ResponseEntity.successfulResponse({ user }, res);
  };
  
  static confirmOrder = async (req, res) => {
    const email = req.body.email;
    const orderId = uid.generate();

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        $push: {
          order: {
            orderId: orderId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("cart");

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return ResponseEntity.successfulResponse({ user }, res);
  };

  static getCart = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const user = await User.findOne({
      email: email,
    }).select("cart");

    if (!user) {
      return ResponseEntity.errorNotFoundResponse(userObj, res);
    }

    return ResponseEntity.successfulResponse({ user }, res);
  };
}

module.exports = UserService;
