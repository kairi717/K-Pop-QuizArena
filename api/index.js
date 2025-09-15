// api/index.js
const userHandler = require('./user.js');
const rankingHandler = require('./ranking.js');

module.exports = async (req, res) => {
  const { url } = req;

  if (url.startsWith('/api/user/')) {
    return userHandler(req, res);
  }

  if (url.startsWith('/api/ranking/')) {
    return rankingHandler(req, res);
  }

  res.status(404).json({ message: 'Global API endpoint not found.' });
};