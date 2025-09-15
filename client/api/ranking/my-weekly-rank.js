// api/ranking/my-weekly-rank.js

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
    const myScoreResult = await client.query(
      `SELECT SUM(score) AS weekly_score
       FROM quiz_scores
       WHERE user_id = $1 AND submitted_at >= date_trunc('week', NOW())`,
      [userId]
    );

    const myWeeklyScore = parseInt(myScoreResult.rows[0].weekly_score || 0);

    if (myWeeklyScore === 0) {
      return res.status(200).json({ rank: 'N/A', weekly_score: 0 });
    }

    const myRankResult = await client.query(
      `SELECT COUNT(*) + 1 AS rank
       FROM (
          SELECT user_id, SUM(score) AS total_score
          FROM quiz_scores
          WHERE submitted_at >= date_trunc('week', NOW())
          GROUP BY user_id
          HAVING SUM(score) > $1
       ) AS higher_ranks`,
      [myWeeklyScore]
    );

    res.status(200).json({
      rank: parseInt(myRankResult.rows[0].rank),
      weekly_score: myWeeklyScore
    });
  } catch (error) {
    console.error('🔴 Error fetching my weekly rank:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
