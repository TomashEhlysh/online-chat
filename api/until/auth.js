const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}

function issueToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, secretKey, { expiresIn });
}

module.exports = { verifyToken, issueToken };