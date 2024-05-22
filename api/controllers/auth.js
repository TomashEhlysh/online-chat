const db = require("../until/db");
const bcrypt = require("bcrypt");
const { verifyToken, issueToken } = require("../until/auth");
const sendMail = require("../until/mail");

exports.registerUser = (req, res, next) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let checkMail = "";
  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    checkMail += characters.charAt(randomIndex);
  }
  const recipientEmail = req.body.email;
  const emailSubject = "Підтвердження пошти у чаті :)";
  const emailHtmlContent = `<div><p>Привіт,</p><p>Прохання перейти за посиланням: <a href='${process.env.API_PAGE}/auth/checkUserEmail?userAccess=${checkMail}&userEmail=${recipientEmail}'>Підтвердити пошту</a></p><p>Після підтвердження прохання увійти на сайт :)</p><br><p>Дякую</p></div>`;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [recipientEmail],
    (err, results) => {
      if (err) {
        console.error("Помилка запиту до бази даних:", err);
        return;
      }
      if (results.length > 0) {
        res.status(401).json({
          info: "User exist",
        });
      } else {
        const plainPassword = req.body.password;
        const userLogin = req.body.login;
        const saltRounds = 10;
        bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
          if (err) {
            console.error("Error occurred while hashing password:", err);
            return;
          }
          const sql =
            "INSERT INTO `users`(`email`, `password`, `role`, `checkEmail`, `login`) VALUES (?, ?, 'user', ?, ?)";
          const values = [recipientEmail, hash, checkMail, userLogin];
          db.query(sql, values, (err, result) => {
            if (err) throw err;
            sendMail(recipientEmail, emailSubject, emailHtmlContent);
            res.status(201);
          });
        });
      }
    }
  );
};

exports.checkUserEmail = (req, res, next) => {
  const userEmail = req.query.userEmail;
  const userChecker = req.query.userAccess;
  db.query(
    "SELECT * FROM users WHERE email = ? AND checkEmail = ?",
    [userEmail, userChecker],
    (err, results) => {
      if (err) {
        console.error("Помилка запиту до бази даних:", err);
        return;
      }
      if (results.length < 0) {
        res.status(401).json({
          message: "Error check email please contact to administrator",
        });
      } else {
        db.query(
          "UPDATE users SET checkEmail = 'checked' WHERE email = ?",
          [userEmail],
          (err, results) => {
            if (err) throw err;
            res.status(200);
          }
        );
      }
    }
  );
};

exports.loginUser = (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  db.query(
    "SELECT password, role, login FROM users WHERE email = ?",
    [userEmail],
    (error, results, fields) => {
      if(results.length){
        if (error) {
          console.error("Error occurred while fetching data:", error);
          return;
        }
        bcrypt.compare(userPassword, results[0].password, (err, result) => {
          if (err) {
            console.error("Error occurred while comparing passwords:", err);
            return;
          }
          if (result) {
            const userData = {
              userEmail: userEmail,
            };
            if (results[0].role === "admin") {
              userData.isAdmin = true;
            } else {
              userData.isAdmin = false;
            }
            const token = issueToken(userData);
            res.status(202).json({
              email: userEmail,
              token: token,
              login: results[0].login,
              role: results[0].role,
            });
          } else {
            res.status(402).json({
              message: "Password or email is incorrect",
            });
          }
        });
      }else{
        res.status(402).json({
          message: "Password or email is incorrect",
        });
      }
    }
  );
};

exports.gLoginUser = (req, res, next) => {
  const userEmail = req.body.email;
  const checkValidate = req.body.check;
  if (checkValidate === "gmail_validate") {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let tempPassword = "";
    for (let i = 0; i < 15; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      tempPassword += characters.charAt(randomIndex);
    }
    db.query(
      "SELECT role, login FROM users WHERE email = ?",
      [userEmail],
      (error, results, fields) => {
        if (error) {
          console.error("Error occurred while fetching data:", error);
          return;
        }
        if (results.length == 0) {
          const sql =
            "INSERT INTO `users`(`email`, `password`, `login`, `role`, `checkEmail`) VALUES (?, ?, ?, 'user', 'gmailAccount')";
          const values = [userEmail, tempPassword, userEmail];
          db.query(sql, values, (err, result) => {
            if (err) throw err;
            const userData = {
              userEmail: userEmail,
              isAdmin: false,
            };
            const token = issueToken(userData);
            res.status(201).json({
              email: userEmail,
              token: token,
              login: userEmail,
              role: "user",
            });
          });
        } else {
          const userData = {
            userEmail: userEmail,
          };
          if (results[0].role === "admin") {
            userData.isAdmin = true;
          } else {
            userData.isAdmin = false;
          }
          const token = issueToken(userData);
          res.status(202).json({
            email: userEmail,
            token: token,
            login: results[0].login,
            role: results[0].role,
          });
        }
      }
    );
  } else {
    res.status(400).json({
      message: "Please try again",
    });
  }
};

exports.forgotPassword = (req, res, next) => {
  const userEmail = req.body.email;
  db.query(
    "SELECT role FROM users WHERE email = ?",
    [userEmail],
    (error, results, fields) => {
      if (error) {
        console.error("Error occurred while fetching data:", error);
        return;
      }
      if (results.length == 0) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let tempPassword = "";
        for (let i = 0; i < 25; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          tempPassword += characters.charAt(randomIndex);
        }
        const plainPassword = tempPassword;
        const saltRounds = 10;
        bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
          if (err) {
            console.error("Error occurred while hashing password:", err);
            return;
          }
          db.query(
            "UPDATE users SET password = ? WHERE email = ?",
            [hash, userEmail],
            (err, results) => {
              if (err) throw err;
              const recipientEmail = userEmail;
              const emailSubject = "Відновлення паролю на сайті chicago.com.ua";
              const emailHtmlContent = `<div><p>Привіт,</p><p>Новий пароль для сайту <a href='https://chicago.enott.com.ua'>chicago.enott.com.ua</a> згенеровано: ${tempPassword}</p><p>Прохання перейти на сайт та увійти за допомогою нового паролю</p><br><p>Дякую</p></div>`;
              sendMail(recipientEmail, emailSubject, emailHtmlContent);
              res.status(200).json({
                message: "Done",
              });
            }
          );
        });
      }
    }
  );
};

exports.getUser = (req, res, next) => {
  res.status(200).json({
    name: "Tomash",
    email: "Ehysht@gmail.com",
  });
};

exports.checkExpiredToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const now = Math.floor(Date.now() / 1000);
  verifyToken(token)
    .then((decoded) => {
      if (decoded.exp >= now) {
        res.status(202).json({
          message: "token date correct",
        });
      } else {
        res.status(203).json({
          message: "token expired",
        });
      }
    })
    .catch((err) => {
      console.error("Token verification failed:", err);
      res.status(203).send("Invalid token");
    });
};

exports.checkJWT = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  verifyToken(token)
    .then((decoded) => {
      if (decoded.isAdmin) {
        res.status(200).send("admin")
      } else {
        res.status(203).send("Invalid token")
      }
    })
    .catch((err) => {
      console.error("Token verification failed:", err);
      res.status(203).send("Invalid token");
    });
};
