import React from 'react';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function InfoPanel() {
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const mission = useSolarStore((state) => state.mission);
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
    </section>
  );
}
