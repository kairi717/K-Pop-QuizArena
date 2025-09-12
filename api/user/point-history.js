// api/user/point-history.js

const db = require('../db.js');
const { authenticateToken } = require('../utils/auth.js');

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
    const historyResult = await client.query(
      `SELECT points_change, reason, created_at
       FROM point_history
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(historyResult.rows);
  } catch (error) {
    console.error('🔴 Error fetching point history:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
