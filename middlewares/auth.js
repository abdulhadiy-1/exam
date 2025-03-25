const jwt = require("jsonwebtoken");

const Middleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token yo'q." });

  try {
    const decoded = jwt.verify(token, "soz");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Yaroqsiz token." });
  }
};

const ReMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token yo'q." });

  try {
    const decoded = jwt.verify(token, "resoz");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Yaroqsiz token." });
  }
};

const RoleMiddleware = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Token yo'q yoki noto'g'ri." });
  }

  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Sizda bu amalni bajarishga ruxsat yo'q." });
  }

  next();
};

module.exports = { Middleware, RoleMiddleware, ReMiddleware };
