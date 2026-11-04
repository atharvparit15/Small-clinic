
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Backend test
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Small Clinic Backend is running",
  });
});

// Owner Login API
app.post("/api/auth/owner-login", (req, res) => {
  const { username, email, password } = req.body;
  const ownerUsername = (username || email || "").trim();

  if (!ownerUsername || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const sql = `
    SELECT id, username, password_hash, role
    FROM owner_users
    WHERE username = ?
    LIMIT 1
  `;

  db.query(sql, [ownerUsername], async (err, results) => {
    if (err) {
      console.error("Owner login error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    try {
      const owner = results[0];
      const validPassword = await bcrypt.compare(
        password,
        owner.password_hash
      );

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      return res.json({
        success: true,
        user: {
          id: owner.id,
          username: owner.username,
          role: owner.role,
          loginType: "owner",
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Login processing failed",
      });
    }
  });
});

// Clinic Login API
app.post("/api/clinics/login", (req, res) => {
  const { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({
      success: false,
      message: "Clinic login ID and password are required",
    });
  }

  const sql = `
    SELECT id, clinic_name, login_id, password_hash, phone, address, status
    FROM clinics
    WHERE login_id = ?
    LIMIT 1
  `;

  db.query(sql, [login_id.trim()], async (err, results) => {
    if (err) {
      console.error("Clinic login error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid clinic login ID or password",
      });
    }

    try {
      const clinic = results[0];

      if (clinic.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "This clinic account is inactive",
        });
      }

      const validPassword = await bcrypt.compare(
        password,
        clinic.password_hash
      );

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid clinic login ID or password",
        });
      }

      return res.json({
        success: true,
        user: {
          id: clinic.id,
          clinic_name: clinic.clinic_name,
          login_id: clinic.login_id,
          phone: clinic.phone,
          address: clinic.address,
          role: "clinic",
          loginType: "clinic",
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Login processing failed",
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
