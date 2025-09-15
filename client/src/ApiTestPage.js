import React, { useState } from 'react';
import axios from 'axios';

function ApiTestPage() {
  const [getResp, setGetResp] = useState(null);
  const [postResp, setPostResp] = useState(null);
  const [quizResp, setQuizResp] = useState(null);
  const [error, setError] = useState('');

  // GET /api/test
  const handleGet = async () => {
    try {
      setError('');
      const res = await axios.get('/api/test?data=hello');
      setGetResp(JSON.stringify(res.data, null, 2));
    } catch(err) {
      console.error(err);
      setError('GET 요청 실패');
    }
  };

  // POST /api/test
  const handlePost = async () => {
    try {
      setError('');
      const res = await axios.post('/api/test', { testData: 'some-data' });
      setPostResp(JSON.stringify(res.data, null, 2));
    } catch(err) {
      console.error(err);
      setError('POST 요청 실패');
    }
  };

  // POST /api/quiz/submitScore
  const handleQuizSubmit = async () => {
    try {
      setError('');
      const token = 'your_jwt_token_here'; // 실제 JWT로 교체
      const res = await axios.post(
        '/api/quiz/submitScore',
        { quizId: 1, score: 95 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizResp(JSON.stringify(res.data, null, 2));
    } catch(err) {
      console.error(err);
      setError('퀴즈 제출 실패');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>API 테스트 페이지</h1>

      <button onClick={handleGet} style={{ marginRight:10 }}>GET /api/test</button>
      <button onClick={handlePost} style={{ marginRight:10 }}>POST /api/test</button>
      <button onClick={handleQuizSubmit}>POST /api/quiz/submitScore</button>

      {error && <pre style={{ color:'red' }}>{error}</pre>}

      {getResp && <div><h3>GET Response:</h3><pre>{getResp}</pre></div>}
      {postResp && <div><h3>POST Response:</h3><pre>{postResp}</pre></div>}
      {quizResp && <div><h3>Quiz Submit Response:</h3><pre>{quizResp}</pre></div>}
    </div>
  );
}

export default ApiTestPage;
