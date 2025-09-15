// /api/test.js

module.exports = async (req, res) => {
  // 요청 메서드 확인
  if (req.method === 'GET') {
    // GET 요청 처리
    res.status(200).json({
      message: 'GET 요청이 성공적으로 처리되었습니다.',
      query: req.query,
    });
  } else if (req.method === 'POST') {
    // POST 요청 처리
    try {
      const { testData } = req.body;
      res.status(200).json({
        message: 'POST 요청이 성공적으로 처리되었습니다.',
        receivedData: testData,
      });
    } catch (error) {
      // 요청 본문 파싱 실패 시
      res.status(400).json({ error: '잘못된 POST 요청 본문입니다.' });
    }
  } else {
    // GET, POST 외 다른 요청 메서드 처리
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};