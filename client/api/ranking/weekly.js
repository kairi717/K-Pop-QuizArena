// api/ranking/weekly.js

const db = require('../db.js');

export default async function handler(req, res) {
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const weeklyRanking = await db.query(
      `SELECT
        u.user_id,
        u.nickname,
        u.picture_url,
        SUM(qs.score) AS weekly_score
       FROM quiz_scores qs
       JOIN users u ON qs.user_id = u.user_id
       WHERE qs.submitted_at >= date_trunc('week', NOW())
       GROUP BY u.user_id, u.nickname, u.picture_url
       ORDER BY weekly_score DESC
       LIMIT 10`
    );

    res.status(200).json(weeklyRanking.rows);
  } catch (error) {
    console.error('🔴 Error fetching weekly ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
