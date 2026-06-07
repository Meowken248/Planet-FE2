import React from 'react';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function GameCompletePanel() {
  const gameStatus = useSolarStore((state) => state.game.status);
  const restartGame = useSolarStore((state) => state.restartGame);

  if (gameStatus !== 'complete') {
    return null;
  }

  return (
    <div className="quiz-backdrop">
      <section className="quiz-panel complete-panel">
        <p className="eyebrow">Hoàn thành hành trình</p>
        <h2>Chúc mừng!</h2>
        <p>
          Bạn đã bay tới và vượt qua thử thách của đủ 8 hành tinh trong hệ Mặt Trời.
        </p>
        <button type="button" className="launch-button" onClick={restartGame}>
          Chơi lại từ đầu
        </button>
      </section>
    </div>
  );
}
