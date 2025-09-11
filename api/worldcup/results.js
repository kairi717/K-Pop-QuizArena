// api/worldcup/results.js

const db = require('../db.js');

export default async function handler(req, res) {
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { cupId } = req.query;

  // cupId가 없는 경우, 모든 월드컵의 결과를 반환하거나 에러 처리
  if (!cupId) {
    return res.status(400).json({ error: 'cupId is required to get results.' });
  }

  const client = await db.getClient();
  try {
    // 특정 cupId에 대한 투표 결과를 집계하여 반환하는 쿼리
    // winner_name을 기준으로 그룹화하고, 각 항목의 투표 수를 세어 정렬합니다.
    const result = await client.query(
      `SELECT winner_name AS name, COUNT(*) AS votes 
       FROM worldcup_votes
       WHERE cup_id = $1
       GROUP BY winner_name
       ORDER BY votes DESC`,
      [cupId]
    );

    res.status(200).json({ results: result.rows });
  } catch (error) {
    console.error('🔴 Error fetching worldcup results:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
