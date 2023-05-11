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

    return ResponseEntity.successfulResponse({ admin: admin }, res);
  };

  static createAdmin = async (req, res) => {
    if (!req.body.firebaseId || !req.body.email || !req.body.name) {
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

  static getRestaurant = async (req, res) => {
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
    const email = req.body.email;
    const restaurantId = req.body.restaurantId;
    const menuId = uid.generate();
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;

    if (!email || !restaurantId || !title || !description || !price) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOneAndUpdate(
      {
        email: email,
      },
      {
        $push: {
          restaurant: {
            menu: {
              menuId: menuId,
              title: title,
              description: description,
              price: price
            }
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
}

module.exports = AdminService;
