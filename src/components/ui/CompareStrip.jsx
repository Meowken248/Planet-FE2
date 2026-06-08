import React from 'react';
import { planets } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';
import PanelToggle from './PanelToggle.jsx';

export default function CompareStrip() {
  const selectPlanet = useSolarStore((state) => state.selectPlanet);
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const completedPlanetIds = useSolarStore((state) => state.game.completedPlanetIds);
  const collapsed = useSolarStore((state) => state.collapsedPanels.compare);
  const maxRadius = Math.max(...planets.map((planet) => planet.radius));

  return (
    <section className={`compare-strip fold-panel ${collapsed ? 'is-collapsed' : ''}`} aria-label="So sánh kích thước hành tinh">
      <PanelToggle panelId="compare" title="So sánh" meta={planets.length} />
      <div className="panel-fold-body">
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
      </div>
    </section>
  );
}
