// api/quiz/submit-score.js

const db = require('../../db.js');
const { authenticateToken } = require('../../utils/auth.js');

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch(err) { reject(err); }
    });
    req.on('error', reject);
  });
}


module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const authResult = await authenticateToken(req);
  if (authResult.error) return res.status(authResult.status).json({ message: authResult.error });
  const { userId } = authResult.user;

  const { quizId, score } = await parseBody(req);

  if (!quizId || score === undefined) return res.status(400).json({ error: 'Quiz ID and score are required.' });

  const client = await db.getClient();
  try {
    await client.query(
      'INSERT INTO quiz_scores (user_id, quiz_id, score) VALUES ($1, $2, $3)',
      [userId, quizId, score]
    );
    res.status(201).json({ success: true, message: 'Score submitted successfully.' });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
};
