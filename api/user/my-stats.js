// api/user/my-stats.js

const jwt = require('jsonwebtoken');
const db = require('../db.js');

// JWT 토큰 검증 함수 (재사용)
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
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 인증 확인
  const authResult = authenticateToken(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ message: authResult.error });
  }
  const { userId } = authResult.user;

  const client = await db.getClient();
  try {
    const statsResult = await client.query(
      `SELECT
        COALESCE(SUM(score), 0) AS total_score,
        COUNT(*) AS quizzes_completed
       FROM quiz_scores
       WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json(statsResult.rows[0]);
  } catch (error) {
    console.error('🔴 Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
