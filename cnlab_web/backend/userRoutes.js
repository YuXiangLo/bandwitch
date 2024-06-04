const express = require("express");
const fs = require("fs");
const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  fs.readFile("data/password.json", "utf8", (err, data) => {
    if (err) {
      console.error(`File read error: ${err}`);
      res.status(500).send("Internal Server Error");
      return;
    }

    const users = JSON.parse(data);
    const user = users.find(
      (u) => u.Account === username && u.Password === password
    );

    if (user) {
      res.json({ success: true, username });
    } else {
      res.json({ success: false });
    }
  });
});

router.get("/user/:username", (req, res) => {
  const username = req.params.username;
  const filepath = `./data/${username}.json`;

  fs.readFile(filepath, "utf8", (err, data) => {
    if (err) {
      console.error(`File read error: ${err}`);
      res.status(404).send("User not found");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

module.exports = router;
