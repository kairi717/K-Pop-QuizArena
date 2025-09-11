// /api/auth/google.js

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('../db.js');

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  // Vercel 환경에서는 기본 URL을 자동으로 감지합니다.
  process.env.GOOGLE_REDIRECT_URI || 'https://k-pop-quiz-arena.vercel.app/auth/google/callback'
);

export default async function handler(req, res) {
  // POST 요청이 아니면 405 오류 반환
  if (req.method !== 'POST') {
    console.log('[API] /api/auth/google - Method Not Allowed:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  console.log('[API] /api/auth/google - POST 요청 수신');
  try {
    const { code } = req.body;
    if (!code) {
      console.log('[API] 오류: 인증 코드가 없습니다.');
      return res.status(400).json({ message: "Authorization code is missing." });
    }
    console.log('[API] 1. 인증 코드를 받았습니다:', code.substring(0, 10) + '...');

    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'https://k-pop-quiz-arena.vercel.app/auth/google/callback',
    });
    console.log('[API] 2. Google로부터 토큰을 성공적으로 받았습니다.');

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log('[API] 3. ID 토큰 검증에 성공했습니다.');

    const payload = ticket.getPayload();
    const { sub: googleId, email, name: nickname, picture: pictureUrl } = payload;
    console.log('[API] 4. 사용자 정보를 추출했습니다:', email);

    console.log('[API] 5. 데이터베이스 클라이언트 연결을 시도합니다...');
    const client = await db.getClient();
    console.log('[API] 6. 데이터베이스 클라이언트 연결에 성공했습니다.');
    let user;

    try {
      const userResult = await client.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      console.log('[API] 7. DB에서 사용자 조회를 완료했습니다.');

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        console.log('[API] 8a. 기존 사용자를 찾았습니다:', user.email);
        await client.query(
          'UPDATE users SET nickname = $1, picture_url = $2 WHERE user_id = $3',
          [nickname, pictureUrl, user.user_id]
        );
      } else {
        console.log('[API] 8b. 신규 사용자입니다. DB에 추가합니다...');
        const newUserResult = await client.query(
          'INSERT INTO users (google_id, email, nickname, picture_url, points) VALUES ($1, $2, $3, $4, 0) RETURNING *',
          [googleId, email, nickname, pictureUrl]
        );
        user = newUserResult.rows[0];
        console.log('[API] 8b-1. 신규 사용자 추가 완료:', user.email);
      }

      const appToken = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      console.log('[API] 9. JWT 토큰 생성을 완료했습니다.');

      res.status(200).json({ token: appToken, user: user });
      console.log('[API] 10. 프론트엔드로 최종 응답을 보냈습니다.');

    } finally {
      client.release();
      console.log('[API] 데이터베이스 클라이언트를 반환했습니다.');
    }
  } catch (error) {
    console.error('🔴 Google Auth-DB-JWT 처리 중 오류:', error);
    res.status(400).json({ message: "Authentication failed", error: error.message });
  }
}
