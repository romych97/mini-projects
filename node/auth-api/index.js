const express = require("express");
const app = express();
app.use(express.json());

const USER_ENTITY = {};

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MINUTES = 15;
const TRACK_WINDOW_MINUTES = 10;

// Function to simulate authentication
function authenticate(login, password) {
  return login === "admin" && password === "password123";
}

app.post("/api/login", (req, res) => {
  const { login, password } = req.body;
  const ip = req.ip;

  const now = new Date();

  // initialize login entity
  if (!USER_ENTITY[ip]) {
    USER_ENTITY[ip] = { fails: 0, lastAttempt: now, blockedUntil: null };
  }

  const currentUser = USER_ENTITY[ip];

  // check if the IP is blocked
  if (currentUser.blockedUntil && currentUser.blockedUntil > now) {
    return res
      .status(429)
      .json({ status: "error", message: "Too many attempts. Try later." });
  }

  // reset fails if the last attempt was outside the tracking window
  if (now - currentUser.lastAttempt > TRACK_WINDOW_MINUTES * 60 * 1000) {
    currentUser.fails = 0;
  }

  currentUser.lastAttempt = now;

  if (authenticate(login, password)) {
    // if authentication is successful, reset the currentUser var
    currentUser.fails = 0;
    currentUser.blockedUntil = null;
    return res.json({ status: "success", message: "Login successful" });
  } else {
    // if authentication fails, increment the fail count
    currentUser.fails += 1;
    console.log("🚀 ~ app.post ~ currentUser.fails:", currentUser.fails);

    if (currentUser.fails >= MAX_ATTEMPTS) {
      currentUser.blockedUntil = new Date(
        now.getTime() + BLOCK_TIME_MINUTES * 60 * 1000
      );
      return res
        .status(429)
        .json({ status: "error", message: "Too many attempts. Try later." });
    }

    return res
      .status(401)
      .json({ status: "error", message: "Invalid login or password." });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
