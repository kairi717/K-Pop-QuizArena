const { Pool } = require('pg');
// Vercel 환경에서는 .env 파일 대신 Vercel 대시보드의 환경 변수를 사용하므로 dotenv 호출을 제거합니다.
// require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // 💥 연결 타임아웃을 설정하여 무한정 기다리지 않도록 합니다.
  connectionTimeoutMillis: 5000, // 5초
  // 💥 Vercel 환경에서의 안정성을 위한 추가 옵션
  idleTimeoutMillis: 10000, // 유휴 클라이언트 타임아웃 10초
  allowExitOnIdle: true,    // 유휴 상태에서 프로세스 종료 허용
  max: 10,                  // 최대 클라이언트 수

  ssl: {
    rejectUnauthorized: false
  }
});

// 풀(Pool)에서 발생하는 모든 에러를 처리하는 이벤트 리스너를 추가합니다.
// 이렇게 하면 유휴 상태(Idle)의 클라이언트가 데이터베이스 서버에 의해 연결이 끊겼을 때
// 발생하는 에러로 인해 Node.js 프로세스 전체가 다운되는 것을 방지할 수 있습니다.
pool.on('error', (err, client) => {
  console.error('🔴 데이터베이스 풀에서 예기치 않은 오류 발생:', err);
});

// 💥 데이터베이스 연결을 비동기 함수로 테스트하여 오류를 확실하게 잡습니다.
const checkDbConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('🟢 Database connected successfully!');
  } catch (err) {
    // 오류가 발생하면, 어떤 오류인지 자세하게 출력합니다.
    console.error('🔴🔴🔴 DATABASE CONNECTION FAILED 🔴🔴🔴');
    console.error('Please check your .env file and ensure the PostgreSQL server is running.');
    console.error('Error Details:', err.message);
    // 서버리스 환경에서는 프로세스를 종료하는 대신, 오류를 던져서
    // 호출한 쪽에서 처리하도록 하거나, 단순히 로그만 남기고 다음 요청을 준비하게 합니다.
    // process.exit(1); 
  } finally {
    // 연결 테스트에 사용된 클라이언트는 즉시 반납합니다.
    if (client) {
      client.release();
    }
  }
};

// 💥 서버 시작 시 이 함수를 호출할 수 있도록 export 합니다.
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(), // 💥 다른 파일에서 DB 클라이언트를 가져갈 수 있도록 getClient 함수를 추가합니다.
  checkDbConnection, 
};