const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
