const db = require('./db.js');
const { authenticateToken } = require('./utils/auth.js');

module.exports = async (req, res) => {
  const authResult = await authenticateToken(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ message: authResult.error });
  }
  const { userId } = authResult.user;

  const client = await db.getClient();
  try {
    // URL 경로에 따라 분기 처리
    if (req.url.startsWith('/api/user/me')) {
      const userResult = await client.query('SELECT user_id, email, nickname, picture_url, points FROM users WHERE user_id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json(userResult.rows[0]);
    }

    if (req.url.startsWith('/api/user/my-stats')) {
      const statsResult = await client.query(
        `SELECT 
           (SELECT SUM(score) FROM quiz_scores WHERE user_id = $1) as total_score,
           (SELECT COUNT(*) FROM quiz_scores WHERE user_id = $1) as quizzes_completed
         FROM users WHERE user_id = $1`,
        [userId]
      );
      return res.status(200).json(statsResult.rows[0] || { total_score: 0, quizzes_completed: 0 });
    }

    if (req.url.startsWith('/api/user/point-history')) {
      const historyResult = await client.query(
        'SELECT reason, points_change, created_at FROM point_history WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return res.status(200).json(historyResult.rows);
    }

    // 일치하는 경로가 없을 경우
    return res.status(404).json({ message: 'API endpoint not found.' });

  } catch (error) {
    console.error('🔴 Error in /api/user handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
};