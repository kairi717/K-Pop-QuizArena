// api/auth/google.js
import { OAuth2Client } from "google-auth-library";

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // 환경 변수 사용
);

export default async function handler(req, res) {
  try {
    const { code } = req.query; // GET 파라미터로 받기

    // oAuth2Client 생성 시 redirect_uri를 설정했으므로, getToken에서는 생략 가능합니다.
    const { tokens } = await oAuth2Client.getToken(code);

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    res.status(200).json({
      token: tokens.id_token,
      user: payload,
    });
  } catch (error) {
    res.status(400).json({ message: "Authentication failed", error: error.message });
  }
}
