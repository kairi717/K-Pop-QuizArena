// api/index.js
const userHandler = require('./user.js');
const rankingHandler = require('./ranking.js');
const testHandler = require('./test.js').default; // .default를 추가하여 ES 모듈을 가져옵니다.

module.exports = async (req, res) => {
  const { url } = req;

  if (url.startsWith('/api/user/')) {
    return userHandler(req, res);
  }

  if (url.startsWith('/api/ranking/')) {
    return rankingHandler(req, res);
  }

  if (url.startsWith('/api/test')) {
    return testHandler(req, res);
  }

  res.status(404).json({ message: 'Global API endpoint not found.' });
};