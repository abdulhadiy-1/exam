const express = require("express");
const { connectDb } = require("./config/db");
const logger = require("./middlewares/logger");
const RegionRoute = require("./routes/region");
const AuthRoute = require("./routes/auth");
const UserRoute = require("./routes/user");
const CategoryRoute = require("./routes/category");
const ResursRoute = require("./routes/resurs");

logger.info("Логгер настроен и работает!");
const app = express();
app.use(express.json());
connectDb();

app.use("/region", RegionRoute);
app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/category", CategoryRoute);
app.use("/resurs", ResursRoute);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
