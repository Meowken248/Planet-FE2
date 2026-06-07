import React from 'react';
import { planets } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function PlanetList() {
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const completedPlanetIds = useSolarStore((state) => state.game.completedPlanetIds);
  const selectPlanet = useSolarStore((state) => state.selectPlanet);

  return (
    <aside className="planet-list" aria-label="Danh sách hành tinh">
      {planets.map((planet) => (
        <button
          key={planet.id}
          type="button"
          className={planet.id === selectedPlanetId ? 'active' : ''}
          onClick={() => selectPlanet(planet.id)}
        >
          <span className={`planet-dot ${planet.id}`} />
          <span>
            <strong>{planet.name}</strong>
            <small>
              {completedPlanetIds.includes(planet.id) ? 'Đã hoàn thành' : planet.tagline}
            </small>
          </span>
          {completedPlanetIds.includes(planet.id) && <em>OK</em>}
        </button>
      ))}
    </aside>
  );
}
