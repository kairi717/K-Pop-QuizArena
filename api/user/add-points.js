// api/user/add-points.js

const jwt = require('jsonwebtoken');
const db = require('../db.js');

// JWT 토큰 검증 미들웨어
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
  // POST 요청이 아니면 405 Method Not Allowed 오류를 반환합니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // JWT 토큰을 검증합니다.
  const authResult = authenticateToken(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ message: authResult.error });
  }
  const { userId } = authResult.user;

  const { pointsToAdd, contentType } = req.body;
  const dbClient = await db.getClient();

  try {
    // 트랜잭션 시작
    await dbClient.query('BEGIN');

    // 포인트 내역 기록
    await dbClient.query(
      'INSERT INTO point_history (user_id, points_change, reason) VALUES ($1, $2, $3)',
      [userId, pointsToAdd, `Ad watched for ${contentType}`]
    );

    // 총 포인트 업데이트
    const result = await dbClient.query(
      'UPDATE users SET points = points + $1 WHERE user_id = $2 RETURNING points',
      [pointsToAdd, userId]
    );

    // 트랜잭션 커밋
    await dbClient.query('COMMIT');

    res.status(200).json({ success: true, updatedPoints: result.rows[0].points });
  } catch (error) {
    // 트랜잭션 롤백
    await dbClient.query('ROLLBACK');
    console.error('🔴 Error adding points:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  } finally {
    // 클라이언트 연결 반환
    dbClient.release();
  }
}
