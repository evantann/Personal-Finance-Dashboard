const express = require("express");
const router = express.Router();
const db = require("../database");
const bcrypt = require("bcrypt");

// Users sign in
router.route("/").post(async (req, res) => {
  const { username, password } = req.body;
  try {
    const results = await db.getUserByUsername(username);
    if (results[0].length != 1) {
      return res.status(401).json({ error: "Invalid username." });
    }
    const { password: hash } = results[0][0];
    const { user_id } = results[0][0];
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      req.session.user_id = user_id;
      res.render("dashboard");
    } else {
      res.status(401).json({ error: "Invalid password." });
    }
  } catch (error) {
    console.error("Internal Server Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// New users sign up
router.route("/signup").post( async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const existingUser = await db.getUserByUsername(username);
    if (existingUser[0].length > 0) {
      return res.status(409).json({ error: "Usename already exists." });
    }
    const hash = await bcrypt.hash(password, 10); // generates salt and hash
    await db.addUser(username, hash);
    const results = await db.getUserByUsername(username);
    const { user_id } = results[0][0];
    req.session.user_id = user_id;
    res.render("link");
  } catch (error) {
    console.error("Internal Server Error", error);
    res.status(500).json({ error: "Internal Server Errror" });
  }
});

module.exports = router;