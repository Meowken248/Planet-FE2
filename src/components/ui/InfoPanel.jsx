import React from 'react';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function InfoPanel() {
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const mission = useSolarStore((state) => state.mission);
  const openStoryBook = useSolarStore((state) => state.openStoryBook);
  const openQuiz = useSolarStore((state) => state.openQuiz);
  const planet = planetMap[selectedPlanetId];
  const isMissionTarget = mission.status === 'scan' && mission.targetId === planet.id;

  return (
    <section className="info-panel" aria-live="polite">
      <div className="info-heading">
        <span className={`planet-orb ${planet.id}`} />
        <div>
          <p>{planet.tagline}</p>
          <h2>{planet.name}</h2>
        </div>
      </div>

      {isMissionTarget && <span className="scan-badge">Đã quét bề mặt</span>}

      <p className="description">{planet.description}</p>

      <dl className="planet-stats">
        <div>
          <dt>Đường kính</dt>
          <dd>{planet.diameter}</dd>
        </div>
        <div>
          <dt>Ngày</dt>
          <dd>{planet.day}</dd>
        </div>
        <div>
          <dt>Năm</dt>
          <dd>{planet.year}</dd>
        </div>
        <div>
          <dt>Khoang cach</dt>
          <dd>{planet.distance}</dd>
        </div>
        <div>
          <dt>Nhiet do</dt>
          <dd>{planet.temperature}</dd>
        </div>
      </dl>

      <div className="fact-row">
        {planet.facts.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>

      <div className="info-actions">
        <button type="button" className="action-btn story-btn" onClick={openStoryBook}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Kể Chuyện
        </button>
        <button type="button" className="action-btn quiz-btn" onClick={openQuiz}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Thử Thách
        </button>
      </div>
    </section>
  );
}
