
// api/user/me.js

const jwt = require('jsonwebtoken');
const db = require('../db.js');

// JWT 토큰 검증 미들웨어
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authResult = authenticateToken(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ message: authResult.error });
  }
  const { userId } = authResult.user;

  const client = await db.getClient();
  try {
    const userResult = await client.query(
      'SELECT user_id, email, nickname, picture_url, points FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (error) {
    console.error('🔴 Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
