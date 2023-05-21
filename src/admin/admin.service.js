const uid = require("short-uuid");
const Admin = require("./admin.schema");
const adminObj = "Admin";

const ResponseEntity = require("../entities/response.entity");

class AdminService {
  static getAdmin = async (req, res) => {
    const firebaseId = req.query.firebaseId;

    if (!firebaseId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOne({
      firebaseId: firebaseId,
    });

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return ResponseEntity.dataResponse(admin, res);
  };

  static createAdmin = async (req, res) => {
    const firebaseId = req.body.firebaseId;
    const email = req.body.email;
    const name = req.body.name;

    if (!firebaseId || !email || !name) {
      return ResponseEntity.errorNullResponse(res);
    }

    const adminBody = {
      firebaseId: firebaseId,
      email: email,
      name: name,
      restaurant: [],
      order: [],
    };

    await Admin.create(adminBody);

    return ResponseEntity.messageResponse("Admin created successfully.", true, res);
  };

  static updateAdmin = async (req, res) => {
    const firebaseId = req.body.firebaseId;

    if (!firebaseId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOneAndUpdate(
      {
        firebaseId: firebaseId,
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

    return ResponseEntity.messageResponse("Admin updated successfully.", true, res);
  };

  static deleteAdmin = async (req, res) => {
    const firebaseId = req.body.firebaseId;

    if (!firebaseId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOneAndDelete({
      firebaseId: firebaseId,
    });

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return ResponseEntity.messageResponse(
      `Admin with firebaseId ${firebaseId} has been deleted.`,
      true,
      res
    );
  };

  static getAllRestaurant = async (req, res) => {
    const restaurant = await Admin.aggregate([
      {
        $unwind: "$restaurant",
      },
      {
        $project: {
          _id: 0,
          restaurantId: "$restaurant.restaurantId",
          restaurantName: "$restaurant.restaurantName",
          menuList: "$restaurant.menuList",
        },
      },
    ]);

    return ResponseEntity.dataResponse({ restaurant }, res);
  };

  static searchRestaurant = async (req, res) => {
    const restaurantQuery = req.query.restaurantQuery;

    if (!restaurantQuery) {
      return ResponseEntity.errorNullResponse(res);
    }

    const restaurant = await Admin.aggregate([
      {
        $unwind: "$restaurant",
      },
      {
        $match: {
          $or: [
            {
              "restaurant.restaurantName": {
                $regex: new RegExp(restaurantQuery, "i"),
              },
            },
            {
              "restaurant.menuList.menuName": {
                $regex: new RegExp(restaurantQuery, "i"),
              },
            },
          ],
        },
      },
      {
        $replaceRoot: {
          newRoot: "$restaurant",
        },
      },
    ]);

    if (restaurant.length == 0) {
      return ResponseEntity.dataResponse({ restaurant }, res);
    }

    return ResponseEntity.dataResponse({ restaurant }, res);
  };

  static getOrder = async (req, res) => {
    const firebaseId = req.body.firebaseId;

    if (!firebaseId) {
      return ResponseEntity.errorNullResponse(res);
    }

    const admin = await Admin.findOne({
      firebaseId: firebaseId,
    }).select("order");

    if (!admin) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    return ResponseEntity.dataResponse(admin, res);
  };

  static addRestaurant = async (req, res) => {
    const firebaseId = req.body.firebaseId;
    const restaurantId = uid.generate();
    const restaurantName = req.body.restaurantName;

    if (!firebaseId || !restaurantId || !restaurantName) {
      return ResponseEntity.errorNullResponse(res);
    }

    const adminFind = await Admin.findOne({
      firebaseId: firebaseId,
    });

    if (!adminFind) {
      return ResponseEntity.errorNotFoundResponse(adminObj, res);
    }

    await Admin.findOneAndUpdate(
      {
        firebaseId: firebaseId,
      },
      {
        $push: {
          restaurant: {
            restaurantId: restaurantId,
            restaurantName: restaurantName,
            menuList: [],
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return ResponseEntity.messageResponse(
      "Restaurant added successfully.",
      true,
      res
    );
  };

  static addMenu = async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const menuId = uid.generate();
    const menuName = req.body.menuName;
    const description = req.body.description;
    const price = req.body.price;

    if (!restaurantId || !menuName || !description || !price) {
      return ResponseEntity.errorNullResponse(res);
    }

    const restaurantFind = await Admin.findOne({
      "restaurant.restaurantId": restaurantId,
    });

    if (!restaurantFind) {
      return ResponseEntity.errorNotFoundResponse("Restaurant", res);
    }

    await Admin.findOneAndUpdate(
      {
        "restaurant.restaurantId": restaurantId,
      },
      {
        $push: {
          "restaurant.$.menuList": {
            menuId: menuId,
            menuName: menuName,
            description: description,
            price: price,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return ResponseEntity.dataResponse("Menu added successfully.", res);
  };
}

module.exports = AdminService;
