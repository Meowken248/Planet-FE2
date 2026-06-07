import React from 'react';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function ControlPanel() {
  const mode = useSolarStore((state) => state.mode);
  const speed = useSolarStore((state) => state.speed);
  const showOrbits = useSolarStore((state) => state.showOrbits);
  const showLabels = useSolarStore((state) => state.showLabels);
  const setMode = useSolarStore((state) => state.setMode);
  const setSpeed = useSolarStore((state) => state.setSpeed);
  const toggleOrbits = useSolarStore((state) => state.toggleOrbits);
  const toggleLabels = useSolarStore((state) => state.toggleLabels);
  const restartGame = useSolarStore((state) => state.restartGame);

  return (
    <section className="control-panel">
      <div className="segmented" role="group" aria-label="Chế độ xem">
        <button
          type="button"
          className={mode === 'cinematic' ? 'active' : ''}
          onClick={() => setMode('cinematic')}
        >
          Điện ảnh
        </button>
        <button
          type="button"
          className={mode === 'realistic' ? 'active' : ''}
          onClick={() => setMode('realistic')}
        >
          Thực tế
        </button>
      </div>

      <label className="speed-control">
        <span>Tốc độ</span>
        <input
          type="range"
          min="0"
          max="4"
          step="0.1"
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
        />
        <strong>{speed.toFixed(1)}x</strong>
      </label>

      <div className="toggle-row">
        <button type="button" className={showOrbits ? 'active' : ''} onClick={toggleOrbits}>
          Quỹ đạo
        </button>
        <button type="button" className={showLabels ? 'active' : ''} onClick={toggleLabels}>
          Nhãn
        </button>
        <button type="button" onClick={restartGame}>
          Chơi lại
        </button>
      </div>
    </section>
  );
}
