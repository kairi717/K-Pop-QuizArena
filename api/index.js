// api/index.js
const db = require('./db.js');
const { authenticateToken } = require('./utils/auth.js');
const userHandler = require('./user.js'); 
const rankingHandler = require('./ranking.js');

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  const { method, headers } = req;
  const url = new URL(req.url, `http://${headers.host}`);
  const path = url.pathname;

  // 1. /api/test
  if (path === '/api/test') {
    if (method === 'GET') {
      const data = url.searchParams.get('data');
      return res.status(200).json({ message: 'GET success', received: data });
    }
    if (method === 'POST') {
      const { testData } = await parseBody(req);
      return res.status(200).json({ message: 'POST success', received: testData });
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  // 2. /api/quiz/submitScore
  if (path === '/api/quiz/submitScore') {
    if (method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const authResult = await authenticateToken(req);
    if (authResult.error) return res.status(authResult.status).json({ message: authResult.error });

    const { userId } = authResult.user;
    const { quizId, score } = await parseBody(req);
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

  // 3. /api/user/*
  if (path.startsWith('/api/user/')) return userHandler(req, res);

  // 4. /api/ranking/*
  if (path.startsWith('/api/ranking/')) return rankingHandler(req, res);

  return res.status(404).json({ message: `Global API endpoint for ${path} not found.` });
};
