const db = require('./db.js');
const { authenticateToken } = require('./utils/auth.js');

module.exports = async (req, res) => {
  const client = await db.getClient();
  try {
    // 주간 랭킹 조회
    if (req.url.startsWith('/api/ranking/weekly')) {
      const rankersResult = await client.query(
        `SELECT u.user_id, u.nickname, u.picture_url, COALESCE(SUM(qs.score), 0) as weekly_score
         FROM users u
         LEFT JOIN quiz_scores qs ON u.user_id = qs.user_id AND qs.created_at >= date_trunc('week', NOW())
         GROUP BY u.user_id
         ORDER BY weekly_score DESC
         LIMIT 10`
      );
      return res.status(200).json({ rankers: rankersResult.rows });
    }

    // 내 주간 랭킹 조회 (인증 필요)
    if (req.url.startsWith('/api/ranking/my-weekly-rank')) {
      const authResult = await authenticateToken(req);
      if (authResult.error) {
        return res.status(authResult.status).json({ message: authResult.error });
      }
      const { userId } = authResult.user;

      const myRankResult = await client.query(
        `WITH user_ranks AS (
           SELECT user_id, COALESCE(SUM(score), 0) as weekly_score, RANK() OVER (ORDER BY COALESCE(SUM(score), 0) DESC) as rank
           FROM quiz_scores
           WHERE created_at >= date_trunc('week', NOW())
           GROUP BY user_id
         )
         SELECT weekly_score, rank FROM user_ranks WHERE user_id = $1`,
        [userId]
      );
      return res.status(200).json(myRankResult.rows[0] || { weekly_score: 0, rank: 'N/A' });
    }

    return res.status(404).json({ message: 'API endpoint not found.' });

  } catch (error) {
    console.error('🔴 Error in /api/ranking handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
};