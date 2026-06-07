import React from 'react';
import { planets } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function CompareStrip() {
  const selectPlanet = useSolarStore((state) => state.selectPlanet);
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const completedPlanetIds = useSolarStore((state) => state.game.completedPlanetIds);
  const maxRadius = Math.max(...planets.map((planet) => planet.radius));

  return (
    <section className="compare-strip" aria-label="So sánh kích thước hành tinh">
      {planets.map((planet) => {
        const size = 18 + (planet.radius / maxRadius) * 42;
        return (
          <button
            key={planet.id}
            type="button"
            className={`${planet.id === selectedPlanetId ? 'active' : ''} ${
              completedPlanetIds.includes(planet.id) ? 'completed' : ''
            }`}
            onClick={() => selectPlanet(planet.id)}
          >
            <span
              className={`mini-planet ${planet.id}`}
              style={{ width: size, height: size }}
            />
            <small>{planet.name}</small>
          </button>
        );
      })}
    </section>
  );
}
