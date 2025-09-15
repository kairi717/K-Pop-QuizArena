// api/index.js
const db = require('./db.js');
const { authenticateToken } = require('./utils/auth.js');

// 각 API 로직을 담당하는 핸들러들을 가져옵니다.
const userHandler = require('./user.js'); 
const rankingHandler = require('./ranking.js');

module.exports = async (req, res) => {
  const { url, method } = req;

  // 1. /api/test 핸들러
  if (url.startsWith('/api/test')) {
    if (method === 'GET') {
      const { data } = req.query;
      return res.status(200).json({ message: 'GET success', received: data || null });
    }
    if (method === 'POST') {
      const { testData } = req.body;
      return res.status(200).json({ message: 'POST success', received: testData });
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  // 2. /api/quiz/submitScore 핸들러
  if (url.startsWith('/api/quiz/submitScore')) {
    if (method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    
    const authResult = await authenticateToken(req);
    if (authResult.error) return res.status(authResult.status).json({ message: authResult.error });
    
    const { userId } = authResult.user;
    const { quizId, score } = req.body;
    if (!quizId || score === undefined) return res.status(400).json({ error: 'Quiz ID and score are required.' });

    const client = await db.getClient();
    try {
      await client.query('INSERT INTO quiz_scores (user_id, quiz_id, score) VALUES ($1, $2, $3)', [userId, quizId, score]);
      return res.status(201).json({ success: true, message: 'Score submitted successfully.' });
    } catch (error) {
      console.error('🔴 Error submitting score:', error);
      return res.status(500).json({ error: 'Internal server error' });
    } finally {
      if (client) client.release();
    }
  }

  // 3. 기존 핸들러 호출
  if (url.startsWith('/api/user/')) {
    return userHandler(req, res);
  }
  if (url.startsWith('/api/ranking/')) {
    return rankingHandler(req, res);
  }

  // 4. 일치하는 핸들러가 없는 경우 404 반환
  return res.status(404).json({ message: `Global API endpoint for ${url} not found.` });
};