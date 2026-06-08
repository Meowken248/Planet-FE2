import React from 'react';
import { planets } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function PlanetList() {
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const completedPlanetIds = useSolarStore((state) => state.game.completedPlanetIds);
  const selectPlanet = useSolarStore((state) => state.selectPlanet);

  return (
    <aside className="planet-list compact-planet-list" aria-label="Danh sách hành tinh">
      <div className="panel-mini-title">
        <span>Planets</span>
        <strong>{planets.length}</strong>
      </div>
      {planets.map((planet) => {
        const completed = completedPlanetIds.includes(planet.id);
        return (
          <button
            key={planet.id}
            type="button"
            className={`${planet.id === selectedPlanetId ? 'active' : ''} ${completed ? 'completed' : ''}`}
            onClick={() => selectPlanet(planet.id)}
            title={planet.tagline}
          >
            <span className={`planet-dot ${planet.id}`} />
            <span>
              <strong>{planet.name}</strong>
              <small>{completed ? 'Hoàn thành' : 'Sẵn sàng'}</small>
            </span>
            {completed && <em>✓</em>}
          </button>
        );
      })}
    </aside>
  );
}