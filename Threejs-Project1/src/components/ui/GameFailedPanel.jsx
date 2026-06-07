import React from 'react';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function GameFailedPanel() {
  const game = useSolarStore((state) => state.game);
  const restartGame = useSolarStore((state) => state.restartGame);

  if (game.status !== 'failed') {
    return null;
  }

  const planet = planetMap[game.failedPlanetId];

  return (
    <div className="quiz-backdrop fail-backdrop">
      <section className="quiz-panel fail-panel">
        <p className="eyebrow">Nhiệm vụ thất bại</p>
        <h2>Thất bại!</h2>
        <p>
          Bạn đã trả lời sai quá 2 câu ở {planet?.name || 'hành tinh này'}.
          Hành trình phải quay lại từ đầu.
        </p>
        <button type="button" className="launch-button" onClick={restartGame}>
          Chơi lại từ đầu
        </button>
      </section>
    </div>
  );
}
