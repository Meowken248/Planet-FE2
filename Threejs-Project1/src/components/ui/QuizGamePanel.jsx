import React from 'react';
import { planetMap } from '../../data/planets.js';
import { quizByPlanet } from '../../data/quiz.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function QuizGamePanel() {
  const game = useSolarStore((state) => state.game);
  const answerGameQuestion = useSolarStore((state) => state.answerGameQuestion);

  if (game.status !== 'quiz' || !game.activePlanetId) {
    return null;
  }

  const planet = planetMap[game.activePlanetId];
  const questions = quizByPlanet[game.activePlanetId];
  const question = questions[game.questionIndex];

  return (
    <div className="quiz-backdrop">
      <section className="quiz-panel game-quiz-panel">
        <p className="eyebrow">Thử thách hành tinh</p>
        <h2>{planet.name}</h2>
        <div className="quiz-meta">
          <span>Câu {game.questionIndex + 1}/5</span>
          <span>Sai {game.wrongCount}/2</span>
        </div>
        <p className="game-question">{question.question}</p>
        <div className="quiz-options four-options">
          {question.answers.map((answer, index) => (
            <button
              key={answer}
              type="button"
              onClick={() => answerGameQuestion(index)}
            >
              <strong>{String.fromCharCode(65 + index)}</strong>
              {answer}
            </button>
          ))}
        </div>
        {game.lastResult === 'wrong' && (
          <p className="quiz-result">Sai rồi. Đáp án đúng luôn nằm ở A, hãy tập trung nhé.</p>
        )}
        {game.lastResult === 'correct' && (
          <p className="quiz-result good">Đúng rồi. Tiếp tục nào.</p>
        )}
        {game.lastResult === 'exploded' && (
          <p className="quiz-result danger">
            Sai quá 2 câu. Hành tinh đã nổ và trò chơi quay lại ban đầu.
          </p>
        )}
      </section>
    </div>
  );
}
