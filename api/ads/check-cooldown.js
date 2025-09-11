// api/ads/check-cooldown.js

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
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 인증 확인
  const authResult = authenticateToken(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ message: authResult.error });
  }
  const { userId } = authResult.user;

  const client = await db.getClient();
  try {
    // 광고 시청 내역을 확인하는 로직 (예시)
    // 실제 로직은 ad-points 테이블의 `created_at`이나 다른 시간 칼럼을 기준으로 쿨타임을 계산해야 합니다.
    const lastAdTimeResult = await client.query(
      `SELECT created_at
       FROM point_history
       WHERE user_id = $1 AND reason LIKE 'Ad watched%'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    const lastAdTime = lastAdTimeResult.rows[0]?.created_at;
    const cooldownMinutes = 15; // 쿨타임 15분 (예시)
    let canWatchAd = true;
    let timeRemaining = 0;

    if (lastAdTime) {
      const now = new Date();
      const lastAdDate = new Date(lastAdTime);
      const diffMinutes = (now - lastAdDate) / (1000 * 60);

      if (diffMinutes < cooldownMinutes) {
        canWatchAd = false;
        timeRemaining = Math.ceil(cooldownMinutes - diffMinutes);
      }
    }

    res.status(200).json({ canWatchAd, timeRemaining });
  } catch (error) {
    console.error('🔴 Error checking ad cooldown:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}
