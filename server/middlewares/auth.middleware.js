const pool = require("../db.js");

const authenticate = async function (req, res, next) {
  const sessionId = req.cookies.session_id;
  if (!sessionId) {
    return res.status(401).json({ error: "you are not logged in" });
  }
  try {
    const data = await pool.query(
      `SELECT
         user_sessions.id AS "sessionId",
         user_sessions.user_id,
         users.id AS "userId",
         users.email AS "userEmail",
         users.username AS "username",
         users.role AS "userRole"
       FROM user_sessions
       INNER JOIN users ON user_sessions.user_id = users.id
       WHERE user_sessions.id = $1`,
      [sessionId]
    );

    if (data.rows.length === 0) {
      return res.status(401).json({ error: "you are not logged in" });
    }
    req.user = data.rows[0];
    next();
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message, message: "error in auth middleware" });
  }
};

const isAdmin = function (req, res, next) {
  const userRole = req.user.userRole;
  if (userRole !== "admin") {
    return res.status(403).json({ message: "forbidden" });
  }
};

module.exports = { authenticate, isAdmin };
