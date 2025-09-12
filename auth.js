const jwt = require('jsonwebtoken');

/**
 * Extracts and verifies the JWT from the request headers.
 * @param {import('http').IncomingMessage} req - The request object.
 * @returns {{user?: object, error?: string, status?: number}}
 */
const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Authentication token is missing.', status: 401 };
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { user: user };
  } catch (err) {
    return { error: 'Invalid or expired token.', status: 403 };
  }
};

module.exports = { authenticateToken };