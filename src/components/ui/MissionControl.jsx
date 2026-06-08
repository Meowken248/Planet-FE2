import React from 'react';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';
import PanelToggle from './PanelToggle.jsx';

const statusLabel = {
  idle: 'Sẵn sàng',
  launch: 'Đang phóng',
  cruise: 'Đang bay',
  scan: 'Đã đáp',
};

export default function MissionControl() {
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const mission = useSolarStore((state) => state.mission);
  const collapsed = useSolarStore((state) => state.collapsedPanels.mission);
  const spacecraftHomePlanetId = useSolarStore((state) => state.spacecraftHomePlanetId);
  const launchMission = useSolarStore((state) => state.launchMission);
  const abortMission = useSolarStore((state) => state.abortMission);
  const followSpacecraft = useSolarStore((state) => state.followSpacecraft);
  const selectPlanet = useSolarStore((state) => state.selectPlanet);

  const selectedTarget = selectedPlanetId;
  const target = planetMap[mission.status === 'idle' ? selectedTarget : mission.targetId];
  const homePlanet = planetMap[spacecraftHomePlanetId] || planetMap.earth;
  const canAbort = mission.status === 'launch' || mission.status === 'cruise';
  const canFollowShip = mission.status === 'launch' || mission.status === 'cruise' || mission.status === 'scan';

  return (
    <section className={`mission-control fold-panel ${collapsed ? 'is-collapsed' : ''}`}>
      <PanelToggle panelId="mission" title="OrbitX" meta={mission.signal} />
      <div className="panel-fold-body">
      <div className="mission-header">
        <div>
          <p className="eyebrow">Trung tâm điều khiển OrbitX</p>
          <h2>{statusLabel[mission.status]}</h2>
        </div>
        <span className={`mission-status ${mission.status}`}>{mission.signal}</span>
      </div>

      <div className="target-selector">
        <span>Điểm đến</span>
        <select
          value={target.id}
          disabled={mission.status !== 'idle' && mission.status !== 'scan'}
          onChange={(event) => selectPlanet(event.target.value)}
        >
          {Object.values(planetMap).map((planet) => (
            <option key={planet.id} value={planet.id}>
              {planet.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mission-progress">
        <span style={{ width: `${Math.round(mission.progress * 100)}%` }} />
      </div>

      <dl className="telemetry-grid">
        <div>
          <dt>Tàu đang ở</dt>
          <dd>{homePlanet.name}</dd>
        </div>
        <div>
          <dt>Điểm đến</dt>
          <dd>{target.name}</dd>
        </div>
        <div>
          <dt>Thời gian đến</dt>
          <dd>{mission.eta}</dd>
        </div>
        <div>
          <dt>Tốc độ</dt>
          <dd>{Math.round(mission.speed).toLocaleString()} m/s</dd>
        </div>
        <div>
          <dt>Nhiên liệu</dt>
          <dd>{mission.fuel.toFixed(1)}%</dd>
        </div>
      </dl>

      <div className="mission-actions">
        <button type="button" className="launch-button" onClick={launchMission}>
          Phóng tàu
        </button>
        <button type="button" onClick={followSpacecraft}>
          Theo dõi tàu
        </button>
        <button type="button" disabled={!canAbort} onClick={abortMission}>
          Hủy
        </button>
      </div>

      <div className="mission-log">
        {mission.log.map((entry) => (
          <p key={entry.id}>
            <span>{entry.time}</span>
            {entry.message}
          </p>
        ))}
      </div>
      </div>
    </section>
  );
}



