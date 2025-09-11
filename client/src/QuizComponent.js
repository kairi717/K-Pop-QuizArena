import React from 'react';

function QuizComponent({ quizId }) {
  // quizId를 기반으로 퀴즈 데이터를 가져와서 렌더링하는 로직
  // 지금은 임시로 메시지만 표시합니다.
  // TODO: 실제 퀴즈 로직 구현

  return (
    <div>
      <h3>퀴즈 시작!</h3>
      <p>퀴즈 ID: {quizId}</p>
      <p>여기에 퀴즈 내용이 표시됩니다.</p>
    </div>
  );
}

export default QuizComponent;