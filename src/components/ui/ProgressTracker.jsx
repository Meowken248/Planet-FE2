import React from 'react';
import { planets } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function ProgressTracker() {
  const completedPlanetIds = useSolarStore((state) => state.game.completedPlanetIds);
  const completedCount = completedPlanetIds.length;
  const progress = (completedCount / planets.length) * 100;

  return (
    <section className="progress-tracker dashboard-progress" aria-label="Tiến trình hoàn thành">
      <div className="progress-heading">
        <span>Nhiệm vụ</span>
        <strong>{completedCount}/{planets.length}</strong>
      </div>
      <div className="completion-bar" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="completion-dots">
        {planets.map((planet, index) => {
          const done = completedPlanetIds.includes(planet.id);
          return (
            <span
              key={planet.id}
              className={`${done ? 'done' : ''} ${planet.id}`}
              title={`${planet.name}${done ? ' - đã hoàn thành' : ''}`}
              style={{ '--planet-index': index }}
            >
              <i className={`planet-dot ${planet.id}`} />
              {done && <b>✓</b>}
            </span>
          );
        })}
      </div>
    </section>
  );
}