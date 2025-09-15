// /api/test.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    // GET 요청 처리
    const { data } = req.query;
    res.status(200).json({ message: 'GET success', received: data || null });
  } 
  else if (req.method === 'POST') {
    // POST 요청 처리
    const { testData } = req.body;
    res.status(200).json({ message: 'POST success', received: testData });
  } 
  else {
    // 허용되지 않은 메서드
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
