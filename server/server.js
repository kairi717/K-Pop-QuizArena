require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('./db'); // 💥 db.js를 가져옵니다 (checkDbConnection 포함)
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
app.use(cors({
    origin: 'http://localhost:3000', // React 앱의 주소
  credentials: true,
}));
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- 속도 제한 규칙(limiter) 설정 ---
const isDev = process.env.NODE_ENV === 'development';

console.log(`🚀 Server is running in ${isDev ? 'Development' : 'Production'} mode.`);

// 일반적인 API를 위한 기본 리미터
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
    // 💥 개발 모드일 때는 10000번, 아닐 때는 100번으로 설정
	max: isDev ? 10000 : 100, 
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// 중요한 API를 위한 강력한 리미터
const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    // 💥 개발 모드일 때는 2000번, 아닐 때는 20번으로 설정
    max: isDev ? 2000 : 20,
    message: 'Too many submissions from this IP, please try again after 15 minutes',
});

// --- JWT 토큰 검증 미들웨어 ---
const authenticateToken = (req, res, next) => { /* ... */ };

// --- 모든 API 라우트 (이 부분은 모두 동일합니다) ---

// Google 로그인 처리
app.post('/api/auth/google', async (req, res) => { /* ... */ });

// 포인트 적립
app.post('/api/user/add-points', submissionLimiter, authenticateToken, async (req, res) => {
    const { pointsToAdd, contentType } = req.body;
    const { userId } = req.user;
    const dbClient = await db.getClient(); // 'db.connect()' 대신 'db.getClient()'를 사용하는 것이 좋습니다.
    try {
        await dbClient.query('BEGIN');
        // ... (이하 포인트 적립 로직은 동일)
        await dbClient.query('COMMIT');
        res.status(200).json({ success: true, updatedPoints: result.rows[0].points });
    } catch (error) {
        await dbClient.query('ROLLBACK');
        // ... (에러 처리 로직 동일)
    } finally {
        dbClient.release();
    }
});

// 현재 로그인한 사용자 정보
app.get('/api/user/me', apiLimiter, authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const client = await db.getClient();
  try {
    const userResult = await client.query('SELECT user_id, email, nickname, picture_url, points FROM users WHERE user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(userResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }    
});

// 포인트 내역
app.get('/api/user/point-history', apiLimiter, authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const client = await db.getClient();
  try {
    const historyResult = await client.query(
      'SELECT points_change, reason, created_at FROM point_history WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(historyResult.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }     
});

// 광고 쿨타임 확인
app.get('/api/ads/check-cooldown', apiLimiter, authenticateToken, async (req, res) => { /* ... */ });

// 월드컵 투표
app.post('/api/worldcup/vote', submissionLimiter, authenticateToken, async (req, res) => { /* ... */ });

// 월드컵 결과
app.get('/api/worldcup/results', apiLimiter, async (req, res) => { /* ... */ });

// 퀴즈 랭킹
app.get('/api/quiz/ranking', async (req, res) => {
  const { quizId } = req.query;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required.' });
  }

  try {
    const rankingResult = await db.query(
      `SELECT u.nickname, u.picture_url, qs.score
       FROM quiz_scores qs
       JOIN users u ON qs.user_id = u.user_id
       WHERE qs.quiz_id = $1
       ORDER BY qs.score DESC, qs.submitted_at ASC
       LIMIT 10`,
      [quizId]
    );
    res.status(200).json(rankingResult.rows);
  } catch (error) {
    console.error('🔴 Error fetching quiz ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 주간 랭킹
app.get('/api/ranking/weekly', apiLimiter, async (req, res) => {
    try {
        const weeklyRanking = await db.query(
            `SELECT
                u.user_id,
                u.nickname,
                u.picture_url,
                SUM(qs.score) AS weekly_score
             FROM quiz_scores qs
             JOIN users u ON qs.user_id = u.user_id
             WHERE qs.submitted_at >= date_trunc('week', NOW())
             GROUP BY u.user_id, u.nickname, u.picture_url
             ORDER BY weekly_score DESC
             LIMIT 10`
        );
        res.status(200).json(weeklyRanking.rows);
    } catch (error) {
        console.error('🔴 Error fetching weekly ranking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 나의 주간 랭킹
app.get('/api/ranking/my-weekly-rank', apiLimiter, authenticateToken, async (req, res) => {
    const { userId } = req.user;
    try {
        const myScoreResult = await db.query(
            `SELECT SUM(score) AS weekly_score
             FROM quiz_scores
             WHERE user_id = $1 AND submitted_at >= date_trunc('week', NOW())`,
            [userId]
        );

        const myWeeklyScore = parseInt(myScoreResult.rows[0].weekly_score || 0);

        if (myWeeklyScore === 0) {
            return res.status(200).json({ rank: 'N/A', weekly_score: 0 });
        }

        const myRankResult = await db.query(
            `SELECT COUNT(*) + 1 AS rank
             FROM (
                SELECT user_id, SUM(score) AS total_score
                FROM quiz_scores
                WHERE submitted_at >= date_trunc('week', NOW())
                GROUP BY user_id
                HAVING SUM(score) > $1
             ) AS higher_ranks`,
            [myWeeklyScore]
        );

        res.status(200).json({
            rank: parseInt(myRankResult.rows[0].rank),
            weekly_score: myWeeklyScore
        });

    } catch (error) {
        console.error('🔴 Error fetching my weekly rank:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 나의 전체 누적 점수 및 퀴즈 완료 횟수 조회
app.get('/api/user/my-stats', authenticateToken, async (req, res) => {
    const { userId } = req.user;

    try {
        const statsResult = await db.query(
            `SELECT
                COALESCE(SUM(score), 0) AS total_score,
                COUNT(*) AS quizzes_completed
             FROM quiz_scores
             WHERE user_id = $1`,
            [userId]
        );
        res.status(200).json(statsResult.rows[0]);
    } catch (error) {
        console.error('🔴 Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 퀴즈 점수 제출
app.post('/api/quiz/submit-score', submissionLimiter, authenticateToken, async (req, res) => {
  const { quizId, score } = req.body;
  const { userId } = req.user;
  const client = await db.getClient();
  try {
    await client.query(
      'INSERT INTO quiz_scores (user_id, quiz_id, score) VALUES ($1, $2, $3)',
      [userId, quizId, score]
    );
    res.status(201).json({ success: true, message: 'Score submitted successfully.' });
  } catch (error) {
    console.error('🔴 Error submitting score:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

// 퀴즈 랭킹 조회
app.get('/api/quiz/ranking', async (req, res) => {
  const { quizId } = req.query;
  const client = await db.getClient();
  try {
    const rankingResult = await client.query(
      `SELECT u.nickname, u.picture_url, qs.score ...`, // 기존 쿼리
      [quizId]
    );
    res.status(200).json(rankingResult.rows);
  } catch (error) {
    console.error('🔴 Error fetching quiz ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

// --- 👇 서버 시작 로직을 이 부분으로 교체합니다 ---

const startServer = async () => {
    try {
        // 1. 데이터베이스 연결을 먼저 확인합니다.
        await db.checkDbConnection();

        // 2. 연결이 성공해야만 서버가 요청을 받기 시작합니다.
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
          console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        // checkDbConnection에서 오류가 발생하면, 서버를 시작하지 않고 프로세스를 종료합니다.
        console.error("Failed to start server due to database connection issues.");
        // process.exit(1)은 db.js에서 이미 처리하므로 여기서는 로그만 남깁니다.
    }
};

startServer();