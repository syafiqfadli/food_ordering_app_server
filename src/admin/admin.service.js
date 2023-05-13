const uid = require("short-uuid");
const Admin = require("./admin.schema");
const adminObj = "Admin";

const ResponseEntity = require("../entities/response.entity");

class AdminService {
  static getAdmin = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOne({
      email: email,
    });

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return ResponseEntity.successfulResponse({ admin }, res);
  };

  static createAdmin = async (req, res) => {
    const firebaseId = req.body.firebaseId;
    const email = req.body.email;
    const name = req.body.name;

    if (!firebaseId || !email || !name) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.create(req.body);

    return ResponseEntity.successfulResponse({ admin }, res);
  };

  static updateAdmin = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOneAndUpdate(
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

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return ResponseEntity.successfulResponse({ admin }, res);
  };

  static deleteAdmin = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOneAndDelete({
      email: email,
    });

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return res.json({
      isSuccess: true,
      message: `Admin with email ${email} has been deleted.`,
    });
  };

  static getAllRestaurant = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOne({
      email: email,
    }).select("restaurant");

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return ResponseEntity.successfulResponse({ admin }, res);
  };

  static getOrder = async (req, res) => {
    const email = req.body.email;

    if (!email) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOne({
      email: email,
    }).select("order");

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return ResponseEntity.successfulResponse({ admin }, res);
  };

  static addRestaurant = async (req, res) => {
    const email = req.body.email;
    const restaurantId = uid.generate();
    const restaurantName = req.body.restaurantName;

    if (!email || !restaurantId || !restaurantName) {
      return ResponseEntity.errorNullResponse(res);
    }

    const adminFind = await Admin.findOne({
      email: email,
    });

    if (!adminFind) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    const admin = await Admin.findOneAndUpdate(
      {
        email: email,
      },
      {
        $push: {
          restaurant: {
            restaurantId: restaurantId,
            restaurantName: restaurantName,
            menu: [],
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("restaurant");

    return ResponseEntity.successfulResponse({ admin }, res);
  };

  static addMenu = async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const menuId = uid.generate();
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;

    if (!restaurantId || !title || !description || !price) {
      return ResponseEntity.errorNullResponse(res);
    }

    const restaurantFind = await Admin.findOne({
      "restaurant.restaurantId": restaurantId,
    });

    if (!restaurantFind) {
      return ResponseEntity.errorNotFoundResponse("Restaurant", res);
    }

    const admin = await Admin.findOneAndUpdate(
      {
        "restaurant.restaurantId": restaurantId,
      },
      {
        $push: {
          "restaurant.$.menu": {
            menuId: menuId,
            title: title,
            description: description,
            price: price,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("restaurant.menu");

    return ResponseEntity.successfulResponse({ admin }, res);
  };
}

module.exports = AdminService;
