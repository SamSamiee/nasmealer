const pool = require("../db.js");

const authenticate = async function (req, res, next) {
  // Try cookie first, then fallback to header (for Safari which blocks third-party cookies)
  let sessionId = req.cookies.session_id || req.headers["x-session-id"];
  if (!sessionId) {
    console.log("Auth failed: No session_id cookie or header found. Cookies received:", req.cookies);
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
      console.log("Auth failed: Session not found in database. SessionId:", sessionId);
      return res.status(401).json({ error: "you are not logged in" });
    }
    req.user = data.rows[0];
    next();
  } catch (err) {
    console.error("Auth error - DB query failed:", err.message);
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
