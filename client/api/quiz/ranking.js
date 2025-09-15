// api/quiz/ranking.js

const db = require('../db.js');

module.exports = async (req, res) => {
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { quizId } = req.query;

  // quizId가 없는 경우 오류 반환
  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required.' });
  }

  try {
    const rankingResult = await db.query(
      `SELECT
        u.nickname,
        u.picture_url,
        qs.score
       FROM quiz_scores qs
       JOIN users u ON qs.user_id = u.user_id
       WHERE qs.quiz_id = $1
       ORDER BY qs.score DESC, qs.submitted_at ASC
       LIMIT 10`,
      [quizId]
    );

    res.status(200).json(rankingResult.rows);
  } catch (error) {
    console.error('🔴 Error fetching quiz ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
