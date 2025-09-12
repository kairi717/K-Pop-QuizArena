// api/worldcup/vote.js

const db = require('../db.js');
const { authenticateToken } = require('../utils/auth.js');

module.exports = async (req, res) => {
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

  const { cupId, winnerName } = req.body;
  
  // 필수 데이터 누락 확인
  if (!cupId || !winnerName) {
    return res.status(400).json({ error: 'World Cup ID and winner name are required.' });
  }

  const client = await db.getClient();
  try {
    // 투표 내역을 기록하는 쿼리 (예시)
    // 이 쿼리는 votes 테이블에 cupId와 winnerName을 기록합니다.
    await client.query(
      `INSERT INTO worldcup_votes (user_id, cup_id, winner_name) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, cup_id) DO UPDATE SET winner_name = EXCLUDED.winner_name, voted_at = NOW()`,
      [userId, cupId, winnerName]
    );

    // 투표 결과를 집계하는 쿼리 (예시)
    // 이 쿼리는 worldcup_results 테이블의 votes 수를 1 증가시킵니다.
    await client.query(
      `INSERT INTO worldcup_results (cup_id, participant_name, votes) VALUES ($1, $2, 1)
       ON CONFLICT (cup_id, participant_name) DO UPDATE SET votes = worldcup_results.votes + 1`,
      [cupId, winnerName]
    );

    res.status(200).json({ success: true, message: 'Vote submitted successfully.' });
  } catch (error) {
    console.error('🔴 Error submitting worldcup vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
};
