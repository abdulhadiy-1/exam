const express = require("express");
const { connectDb } = require("./config/db");
const logger = require("./middlewares/logger");
const RegionRoute = require("./routes/region");
const AuthRoute = require("./routes/auth");
const UserRoute = require("./routes/user");
const CategoryRoute = require("./routes/category");
const ResursRoute = require("./routes/resurs");
const courseRegisterRoute = require("./routes/courseRegister");
const CommentRoute = require("./routes/comment");
const sohaRoute = require("./routes/soha");

logger.info("Логгер настроен и работает!");
const app = express();
app.use(express.json());
connectDb();

app.use("/region", RegionRoute);
app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/category", CategoryRoute);
app.use("/resurs", ResursRoute);
app.use("/courseRegister", courseRegisterRoute);
app.use("/comments", CommentRoute);
app.use("/soha", sohaRoute);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
