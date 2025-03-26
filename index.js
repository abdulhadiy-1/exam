const express = require("express");
const { connectDb } = require("./config/db");
const logger = require("./middlewares/logger");
const RegionRoute = require("./routes/region");
const AuthRoute = require("./routes/auth");
const UserRoute = require("./routes/user");
const CategoryRoute = require("./routes/category");
const ResursRoute = require("./routes/resurs");
const FanRoute = require("./routes/fan");
const SohaRoute = require("./routes/soha");
const CourseRegisterRoute = require("./routes/courseRegister");
const CommentRoute = require("./routes/comment");
const multer = require("multer");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

logger.info("Логгер настроен и работает!");
const app = express();
app.use(express.json());
connectDb();

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Загрузка файла
 *     description: Позволяет загружать файлы на сервер.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Файл успешно загружен
 *       400:
 *         description: Файл не загружен
 */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл не загружен!" });
  }
  res.json({ message: "Файл успешно загружен!", file: req.file });
});

/**
 * @swagger
 * /get-url:
 *   post:
 *     summary: Получить URL загруженного файла
 *     description: Возвращает URL для загруженного файла.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 example: "example.jpg"
 *     responses:
 *       200:
 *         description: Возвращает URL файла
 *       400:
 *         description: Файл не указан
 */
app.post("/get-url", (req, res) => {
  const { file } = req.body;
  if (!file) {
    return res.status(400).json({ message: "Файл не указан!" });
  }
  res.json({ url: `http://localhost:3000/uploads/${file}` });
});

app.use("/region", RegionRoute);
app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/category", CategoryRoute);
app.use("/resurs", ResursRoute);
app.use("/courseRegister", CourseRegisterRoute);
app.use("/comments", CommentRoute);
app.use("/soha", SohaRoute);
app.use("/fan", FanRoute);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API документация",
      version: "1.0.0",
      description: "Документация API для работы с ресурсами, пользователями и загрузкой файлов",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }], 
  },
  apis: ["./index.js", "./routes/*.js"],
};

module.exports = swaggerOptions;


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
