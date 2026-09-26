// Auth middleware — protects routes so only logged-in users can use them,
// and optionally restricts a route to a specific role (e.g. "ngo" only).

const jwt = require('jsonwebtoken');

// Use this on any route that requires the user to be logged in.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, access denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Use this AFTER requireAuth on routes only NGOs should access
// (e.g. updating the status of an animal report).
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Only ${role} accounts can do this` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
