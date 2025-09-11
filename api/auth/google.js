// api/auth/google.js
import { OAuth2Client } from "google-auth-library";
import db from "../db.js"; // 💥💥 경로 수정: ../../ -> ../../server/db.js
import jwt from "jsonwebtoken"; // 💥 JWT 모듈 import

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // 환경 변수 사용
);

export default async function handler(req, res) {
  try {
    const { code } = req.query; // GET 파라미터로 받기

    // getToken 호출 시 code와 함께 redirect_uri를 명시적으로 전달하는 것이 더 안정적입니다.
    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // --- 💥 DB 처리 및 JWT 생성 로직 추가 ---
    const { sub: googleId, email, name: nickname, picture: pictureUrl } = payload;

    const client = await db.getClient();
    let user;

    try {
      // 1. DB에서 google_id로 사용자 조회
      const userResult = await client.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

      if (userResult.rows.length > 0) {
        // 2a. 사용자가 존재하면 정보 업데이트 (선택적) 및 user 변수에 할당
        user = userResult.rows[0];
        // 예: 이름이나 사진이 변경되었을 수 있으므로 업데이트
        await client.query(
          'UPDATE users SET nickname = $1, picture_url = $2 WHERE user_id = $3',
          [nickname, pictureUrl, user.user_id]
        );
      } else {
        // 2b. 사용자가 없으면 새로 생성
        const newUserResult = await client.query(
          'INSERT INTO users (google_id, email, nickname, picture_url, points) VALUES ($1, $2, $3, $4, 0) RETURNING *',
          [googleId, email, nickname, pictureUrl]
        );
        user = newUserResult.rows[0];
      }

      // 3. 우리 서비스의 JWT 토큰 생성 (user_id 포함)
      const appToken = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.status(200).json({
        token: appToken, // 💥 우리 앱의 토큰 전달
        user: user,      // 💥 우리 DB의 사용자 정보 전달
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('🔴 Google Auth-DB-JWT 처리 중 오류:', error);
    res.status(400).json({ message: "Authentication failed", error: error.message });
  }
}
