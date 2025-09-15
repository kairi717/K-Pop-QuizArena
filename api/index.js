// api/index.js
const db = require('./db.js');
const { authenticateToken } = require('./utils/auth.js');
const userHandler = require('./user.js'); 
const rankingHandler = require('./ranking.js');

// /api/index.js
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

  // /api/test
  if (path === '/api/test') {
    if (method === 'GET') {
      const data = url.searchParams.get('data');
      return res.status(200).json({ message: 'GET success', received: data });
    }
    if (method === 'POST') {
      const { testData } = await parseBody(req);
      return res.status(200).json({ message: 'POST success', received: testData });
    }
    res.setHeader('Allow', ['GET','POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  // /api/quiz/submitScore
  if (path === '/api/quiz/submitScore') {
    if (method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { quizId, score } = await parseBody(req);
    return res.status(201).json({ success: true, quizId, score });
  }

  return res.status(404).json({ message: `Endpoint ${path} not found.` });
};
