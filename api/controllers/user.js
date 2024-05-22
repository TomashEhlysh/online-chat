const path = require('path');
const multer = require('multer');
const moment = require('moment');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Тільки зображення дозволено.'));
      }
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage})
const { verifyToken, issueToken } = require("../until/auth");
const db = require("../until/db");
const { group } = require('console');

exports.getMessages = (req, res, next) => {
  const userEmail = req.query.email;
  const chatType = req.query.chatType
  const chatId = req.query.chatId
  const token = req.headers.authorization.split(" ")[1];
  verifyToken(token)
    .then((decoded) => {
      if (decoded.userEmail == userEmail) {
        db.query(
          "SELECT * FROM messages WHERE chat_type = ? AND chat_id = ?",
          [chatType, chatId],
          (error, results, fields) => {
            if (error) {
              console.error("Error occurred while fetching data:", error);
              return;
            }
            if (results.length > 0) {
              results.forEach(result => {
                result.date_time = result.date_time ? moment(result.date_time).format('DD.MM.YYYY / HH:mm') : false;
            });
              res.status(200).json(results);
            }
          }
        );
      } else {
        res.status(401).send("Invalid token");
      }
    })
    .catch((err) => {
      console.error("Token verification failed:", err);
      res.status(401).send("Invalid token");
    });
};

exports.getGroups = (req, res, next) => {
  db.query(
    "SELECT * FROM `chat_groups` ORDER BY `created_date` DESC ",
    (error, results, fields) => {
      if (error) {
        console.error("Error occurred while fetching data:", error);
        return;
      }
      if (results.length > 0) {
        results.forEach(result => {
          result.created_date = result.created_date ? moment(result.created_date).format('DD.MM.YYYY / HH:mm') : false;
      });
        res.status(200).json(results);
      }
    }
  );
}

exports.createGroupChat = (req, res, next) => {
  const userEmail = req.body.email;
  const groupName = req.body.groupName
  const groupId = 'chatID_' + Date.now()
  const lang = req.body.lang
  const token = req.headers.authorization.split(" ")[1];
  
  verifyToken(token)
    .then((decoded) => {
      if (decoded.userEmail == userEmail) {
        db.query(
          "INSERT INTO `chat_groups`(`name`, `group_id`, `lang`) VALUES (?, ?, ?)",
          [groupName, groupId, lang],
          (error, results, fields) => {
            if (error) {
              console.error("Error occurred while fetching data:", error);
              return;
            }
            res.status(200).json("Added");
          }
        );
      } else {
        res.status(401).send("Invalid token");
      }
    })
    .catch((err) => {
      console.error("Token verification failed:", err);
      res.status(401).send("Invalid token");
    });
};