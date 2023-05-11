const adminRouter = require("./src/admin/admin.router");
const userRouter = require("./src/user/user.router");

const indexModule = (app, express) => {
  app.use(express.json());
  app.use("/order-me-api", adminRouter);
  app.use("/order-me-api", userRouter);
};

module.exports = { indexModule };
