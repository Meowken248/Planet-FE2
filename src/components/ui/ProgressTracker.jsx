import React from 'react';
import { planets } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function ProgressTracker() {
  const completedPlanetIds = useSolarStore((state) => state.game.completedPlanetIds);
  const completedCount = completedPlanetIds.length;

  return (
    <section className="progress-tracker" aria-label="Tiến trình hoàn thành">
      <div className="progress-heading">
        <span>Đã hoàn thành</span>
        <strong>{completedCount}/8</strong>
      </div>
      <div className="completion-bar">
        <span style={{ width: `${(completedCount / planets.length) * 100}%` }} />
      </div>
      <div className="completion-dots">
        {planets.map((planet) => (
          <span
            key={planet.id}
            className={completedPlanetIds.includes(planet.id) ? 'done' : ''}
            title={planet.name}
          >
            {completedPlanetIds.includes(planet.id) ? '✓' : ''}
          </span>
        ))}
      </div>
    </section>
  );
}
