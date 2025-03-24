const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, "soz", {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },"resoz",
    { expiresIn: "7d" }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
