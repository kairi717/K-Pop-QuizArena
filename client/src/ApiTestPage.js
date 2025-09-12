import React, { useState } from 'react';
import axios from 'axios';

/**
 * This component demonstrates the CORRECT way to call an API endpoint.
 * It uses axios to make HTTP requests instead of trying to navigate to the API URL.
 */
function ApiTestPage() {
  const [getResponse, setGetResponse] = useState(null);
  const [postResponse, setPostResponse] = useState(null);
  const [error, setError] = useState('');

  const handleGetRequest = async () => {
    try {
      setError('');
      // ✅ CORRECT: This makes a real HTTP GET request to the server.
      const response = await axios.get('/api/test?data=hello');
      console.log('✅ GET API Success:', response.data);
      setGetResponse(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('🔴 GET API Error:', err);
      setError('Failed to call GET API. Check the console.');
    }
  };

  const handlePostRequest = async () => {
    try {
      setError('');
      // ✅ CORRECT: This makes a real HTTP POST request to the server.
      const response = await axios.post('/api/test', { testData: 'some-data-from-client' });
      console.log('✅ POST API Success:', response.data);
      setPostResponse(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('🔴 POST API Error:', err);
      setError('Failed to call POST API. Check the console.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>API Test Page</h1>
      <p>Use these buttons to correctly call the <code>/api/test</code> endpoint.</p>
      <button onClick={handleGetRequest} style={{ marginRight: '10px' }}>Send GET Request</button>
      <button onClick={handlePostRequest}>Send POST Request</button>
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
      {getResponse && <div><h3>GET Response:</h3><pre style={{ background: '#f0f0f0', padding: '10px' }}>{getResponse}</pre></div>}
      {postResponse && <div><h3>POST Response:</h3><pre style={{ background: '#f0f0f0', padding: '10px' }}>{postResponse}</pre></div>}
    </div>
  );
}

export default ApiTestPage;