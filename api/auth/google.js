// api/auth/google.js
import { OAuth2Client } from "google-auth-library";

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://k-pop-quiz-arena.vercel.app/auth/google/callback' // 배포용 리디렉션 URI
);

export default async function handler(req, res) {
  try {
    const { code } = req.query; // GET 파라미터로 받기

    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

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
