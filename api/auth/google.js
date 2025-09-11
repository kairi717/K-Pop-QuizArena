// /api/auth/google.js
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const db = require("../db.js");

const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://k-pop-quiz-arena.vercel.app/auth/google/callback";

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Authorization code is missing." });
    }

    // 1. 구글 토큰 교환
    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
    });

    // 2. 토큰 검증
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name: nickname, picture: pictureUrl } = payload;

    // 3. DB 처리
    const client = await db.getClient();
    let user;
    try {
      const userResult = await client.query(
        "SELECT * FROM users WHERE google_id = $1",
        [googleId]
      );

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        await client.query(
          "UPDATE users SET nickname = $1, picture_url = $2 WHERE user_id = $3",
          [nickname, pictureUrl, user.user_id]
        );
      } else {
        const newUserResult = await client.query(
          "INSERT INTO users (google_id, email, nickname, picture_url, points) VALUES ($1, $2, $3, $4, 0) RETURNING *",
          [googleId, email, nickname, pictureUrl]
        );
        user = newUserResult.rows[0];
      }

      // 4. JWT 발급
      const appToken = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({ token: appToken, user });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("🔴 Google Auth 처리 중 오류:", error);
    res
      .status(400)
      .json({ message: "Authentication failed", error: error.message });
  }
};
