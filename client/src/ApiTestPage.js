import React, { useState } from 'react';
import axios from 'axios';

function ApiTestPage() {
  const [getResponse, setGetResponse] = useState(null);
  const [postResponse, setPostResponse] = useState(null);
  const [quizResponse, setQuizResponse] = useState(null);
  const [error, setError] = useState('');

  // GET 요청 테스트
  const handleGetRequest = async () => {
    try {
      setError('');
      const response = await axios.get('/api/test?data=hello');
      setGetResponse(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error(err);
      setError('GET 요청 실패');
    }
  };

  // POST 요청 테스트 (/api/test)
  const handlePostRequest = async () => {
    try {
      setError('');
      const response = await axios.post('/api/test', { testData: 'some-data-from-client' });
      setPostResponse(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error(err);
      setError('POST 요청 실패');
    }
  };

  // POST 요청 테스트 (/api/quiz/submitScore)
  const handleQuizSubmit = async () => {
    try {
      setError('');
      const token = 'your_jwt_token_here'; // 실제 JWT 넣기
      const response = await axios.post(
        '/api/quiz/submitScore',
        { quizId: 1, score: 95 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizResponse(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error(err);
      setError('퀴즈 제출 실패');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>API 테스트 페이지</h1>

      <button onClick={handleGetRequest} style={{ marginRight: 10 }}>GET /api/test</button>
      <button onClick={handlePostRequest} style={{ marginRight: 10 }}>POST /api/test</button>
      <button onClick={handleQuizSubmit}>POST /api/quiz/submitScore</button>

      {error && <pre style={{ color: 'red' }}>{error}</pre>}

      {getResponse && (
        <div>
          <h3>GET /api/test Response:</h3>
          <pre style={{ background: '#f0f0f0', padding: 10 }}>{getResponse}</pre>
        </div>
      )}

      {postResponse && (
        <div>
          <h3>POST /api/test Response:</h3>
          <pre style={{ background: '#f0f0f0', padding: 10 }}>{postResponse}</pre>
        </div>
      )}

      {quizResponse && (
        <div>
          <h3>POST /api/quiz/submitScore Response:</h3>
          <pre style={{ background: '#f0f0f0', padding: 10 }}>{quizResponse}</pre>
        </div>
      )}
    </div>
  );
}

export default ApiTestPage;
