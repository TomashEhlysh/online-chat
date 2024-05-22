const path = require('path');
const multer = require('multer');
const moment = require('moment');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Тільки зображення дозволено.'));
      }
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage})
const { verifyToken, issueToken } = require("../until/auth");
const db = require("../until/db");

exports.getAllPosts = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            db.query(
                "SELECT * FROM posts",
                (error, results, fields) => {
                    if (error) {
                        console.error("Error occurred while fetching data:", error);
                        return;
                    }
                    if (results.length > 0) {
                        res.status(200).json(results);
                    } else{
                        res.status(204).json(results);
                    }
                }
            );
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.getAllUsers = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            db.query(
                "SELECT `email`, `name`, `role`, `regDate`, `img` FROM `users`",
                (error, results, fields) => {
                    if (error) {
                        console.error("Error occurred while fetching data:", error);
                        return;
                    }
                    if (results.length > 0) {
                        results.forEach(result => {
                            result.regDate = result.regDate ? moment(result.regDate).format('DD.MM.YYYY') : false;
                        });
                        res.status(200).json(results);
                    } else{
                        res.status(204).json(results);
                    }
                }
            );
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.changeUsers = (req, res, next) => {
    const email = req.body.userEmail
    const name = req.body.name
    const role = req.body.role
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            db.query(
                "UPDATE `users` SET `name`= ?, `role`= ? WHERE `email` = ?",
                [name, role, email],
                (error, results, fields) => {
                    if (error) {
                        console.error("Error occurred while fetching data:", error);
                        return;
                    }
                    if (results.length > 0) {
                        res.status(200).send("Change");
                    } else{
                        res.status(204).send("No chages");
                    }
                }
            );
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.deleteUser = (req, res, next) => {
    const email = req.body.userEmail
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            db.query(
                "DELETE FROM `users` WHERE `email` = ?",
                [email],
                (error, results, fields) => {
                    if (error) {
                        console.error("Error occurred while fetching data:", error);
                        return;
                    }
                    if (results.length > 0) {
                        res.status(200).send("Deleted");
                    } else{
                        res.status(204).send("No deleted");
                    }
                }
            );
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.addAdv = (req, res, next) => {
    upload.single('advImg')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "File upload error" });
        } else if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        const title = req.body.title;
        const descr = req.body.descr;
        const link = req.body.link;
        const type = req.body.type;
        const img = req.file.filename;
        const token = req.headers.authorization.split(" ")[1];
        verifyToken(token)
        .then((decoded) => {
            if (decoded.isAdmin) {
                const sql = "INSERT INTO advertising (title, descr, link, img, advType) VALUES (?,?,?,?,?)";
                const values = [title, descr, link, img, type];
                db.query(sql, values, (err, result) => {
                    if (err) throw err;
                });
                res.status(201).send("Added!");
            } else {
                res.status(401).send("You are not admin");
            }
        })
        .catch((err) => {
            console.error("Token verification failed:", err);
            res.status(401).send("Invalid token");
        });
    });
};

exports.changeAdv = (req, res, next) => {
    upload.single('advImg')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "File upload error" });
        } else if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        const id = req.body.id;
        const title = req.body.title;
        const descr = req.body.descr;
        const link = req.body.link;
        const type = req.body.type;
        const oldImg = req.body.oldImg ? req.body.oldImg : '';
        const img = req.file.filename ? req.file.filename : req.body.oldImg;
        if(req.file.filename){
            fs.unlink(path.join("uploads", oldImg), (err) => {
                if (err) throw err;
            });
        }
        const token = req.headers.authorization.split(" ")[1];
        verifyToken(token)
        .then((decoded) => {
            if (decoded.isAdmin) {
                const sql = "UPDATE `advertising` SET `title`= ?,`descr`= ?,`link`= ?,`img`= ? WHERE `id`= ?";
                const values = [title, descr, link, img, id];
                db.query(sql, values, (err, result) => {
                    if (err) throw err;
                });
                res.status(201).send("Changed!");
            } else {
                res.status(401).send("You are not admin");
            }
        })
        .catch((err) => {
            console.error("Token verification failed:", err);
            res.status(401).send("Invalid token");
        });
    });
};

exports.deleteAdv = (req, res, next) => {
    const id = req.body.id;
    const oldImg = req.body.oldImg;
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            const sql = "DELETE FROM `advertising` WHERE `id` = ?";
            const values = [id];
            db.query(sql, values, (err, result) => {
                if (err) throw err;
                fs.unlink(path.join("uploads", oldImg), (err) => {
                    if (err) throw err;
                });
            });
            res.status(201).send("Deleted!");
        } else {
            res.status(401).send("You are not admin");
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.addForumPost = (req, res, next) => {
    const subject = req.body.subject;
    const title = req.body.title;
    const lang = req.body.lang;
    const descr = req.body.descr;
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            const sql = "INSERT INTO `forum`(`subject`, `title`, `lang`, `descr`) VALUES (?,?,?,?)";
            const values = [subject, title, lang, descr];
            db.query(sql, values, (err, result) => {
                if (err) throw err;
            });
            res.status(201).send("Added!");
        } else {
            res.status(401).send("You are not admin");
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.changeForumPost = (req, res, next) => {
    const id = req.body.id;
    const subject = req.body.subject;
    const title = req.body.title;
    const lang = req.body.lang;
    const descr = req.body.descr;
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            const sql = "UPDATE `forum` SET `subject`= ?,`title`= ?,`lang`= ?,`descr`= ? WHERE id = ?";
            const values = [subject, title, lang, descr, id];
            db.query(sql, values, (err, result) => {
                if (err) throw err;
            });
            res.status(201).send("Changed!");
        } else {
            res.status(401).send("You are not admin");
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.deleteForumPost = (req, res, next) => {
    const id = req.body.id;
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token)
    .then((decoded) => {
        if (decoded.isAdmin) {
            const sql = "DELETE FROM `forum` WHERE `id` = ?";
            const values = [id];
            db.query(sql, values, (err, result) => {
                if (err) throw err;
            });
            res.status(201).send("Deleted!");
        } else {
            res.status(401).send("You are not admin");
        }
    })
    .catch((err) => {
        console.error("Token verification failed:", err);
        res.status(401).send("Invalid token");
    });
};

exports.addInfo = (req, res, next) => {
    upload.single('infoImg')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "File upload error" });
        } else if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        const type = req.body.type;
        const title = req.body.title;
        const descr = req.body.descr;
        const image = req.file.filename;
        const token = req.headers.authorization.split(" ")[1];
        verifyToken(token)
        .then((decoded) => {
            if (decoded.isAdmin) {
                const sql = "INSERT INTO `information`(`type`, `title`, `descr`, `image`) VALUES (?,?,?,?)";
                const values = [type, title, descr, image];
                db.query(sql, values, (err, result) => {
                    if (err) throw err;
                });
                res.status(201).send("Added!");
            } else {
                res.status(401).send("You are not admin");
            }
        })
        .catch((err) => {
            console.error("Token verification failed:", err);
            res.status(401).send("Invalid token");
        });
    });
};