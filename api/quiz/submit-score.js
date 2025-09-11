// api/quiz/submit-score.js

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
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 인증 확인
  const authResult = authenticateToken(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ message: authResult.error });
  }
  const { userId } = authResult.user;

  const { quizId, score } = req.body;
  
  // 필수 데이터 누락 확인
  if (!quizId || score === undefined) {
    return res.status(400).json({ error: 'Quiz ID and score are required.' });
  }

  const client = await db.getClient();
  try {
    // quiz_scores 테이블에 점수 기록
    await client.query(
      'INSERT INTO quiz_scores (user_id, quiz_id, score) VALUES ($1, $2, $3)',
      [userId, quizId, score]
    );

    res.status(201).json({ success: true, message: 'Score submitted successfully.' });
  } catch (error) {
    console.error('🔴 Error submitting score:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
