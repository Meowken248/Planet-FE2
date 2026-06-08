import React from 'react';
import { useSolarStore } from '../../store/useSolarStore.js';

const timelineFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function Icon({ type }) {
  const paths = {
    film: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
      </>
    ),
    orbit: <path d="M4 12c0-3.3 3.6-6 8-6s8 2.7 8 6-3.6 6-8 6-8-2.7-8-6Zm4.5 0a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" />,
    tag: <path d="M20 10.5 13.5 4H5v8.5L11.5 19a2 2 0 0 0 2.8 0l5.7-5.7a2 2 0 0 0 0-2.8ZM8 8h.01" />,
    eye: (
      <>
        <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    reset: <path d="M4 4v6h6M5.4 15a7 7 0 1 0 1.5-7.6L4 10" />,
    antenna: (
      <>
        <path d="M12 19v-7" />
        <path d="M8.5 15.5 12 12l3.5 3.5" />
        <path d="M6 10a6 6 0 0 1 12 0" />
        <path d="M3.5 7.5a10 10 0 0 1 17 0" />
        <circle cx="12" cy="20" r="1" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[type]}
    </svg>
  );
}

export default function ControlPanel() {
  const mode = useSolarStore((state) => state.mode);
  const orbitMode = useSolarStore((state) => state.orbitMode);
  const timelineEpochMs = useSolarStore((state) => state.timelineEpochMs);
  const speed = useSolarStore((state) => state.speed);
  const showOrbits = useSolarStore((state) => state.showOrbits);
  const showLabels = useSolarStore((state) => state.showLabels);
  const cinematicTour = useSolarStore((state) => state.cinematicTour);
  const ephemeris = useSolarStore((state) => state.ephemeris);
  const setMode = useSolarStore((state) => state.setMode);
  const setOrbitMode = useSolarStore((state) => state.setOrbitMode);
  const setTimelineEpochMs = useSolarStore((state) => state.setTimelineEpochMs);
  const nudgeTimelineDays = useSolarStore((state) => state.nudgeTimelineDays);
  const setSpeed = useSolarStore((state) => state.setSpeed);
  const toggleOrbits = useSolarStore((state) => state.toggleOrbits);
  const toggleLabels = useSolarStore((state) => state.toggleLabels);
  const restartGame = useSolarStore((state) => state.restartGame);
  const startCinematicTour = useSolarStore((state) => state.startCinematicTour);
  const stopCinematicTour = useSolarStore((state) => state.stopCinematicTour);
  const timelineStartMs = Date.parse(ephemeris.startDate);
  const timelineStopMs = Date.parse(ephemeris.stopDate);
  const timelineReady = mode === 'realistic' && ephemeris.status === 'ready' && Number.isFinite(timelineStartMs) && Number.isFinite(timelineStopMs);
  const displayedEpoch = Number.isFinite(timelineEpochMs) ? timelineEpochMs : Date.now();

  return (
    <section className="control-panel space-control-panel">
      <div className="segmented compact-segmented" role="group" aria-label="Chế độ xem">
        <button
          type="button"
          className={mode === 'cinematic' ? 'active' : ''}
          onClick={() => setMode('cinematic')}
          title="Điện ảnh"
        >
          <Icon type="film" />
          <span>Điện ảnh</span>
        </button>
        <button
          type="button"
          className={mode === 'realistic' ? 'active' : ''}
          onClick={() => setMode('realistic')}
          title="Thực tế"
        >
          <Icon type="eye" />
          <span>Thực tế</span>
        </button>
      </div>

      <label className="speed-control dashboard-speed">
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

      <div className={`nasa-status ${ephemeris.status}`}>
        <Icon type="antenna" />
        <strong>
          {mode !== 'realistic'
            ? 'READY'
            : ephemeris.status === 'ready'
              ? ephemeris.fromCache
                ? 'CACHE'
                : 'LIVE'
              : ephemeris.status === 'loading'
                ? 'SYNC'
                : ephemeris.status === 'error'
                  ? 'FALLBACK'
                  : 'STANDBY'}
        </strong>
        <span>
          {mode !== 'realistic'
            ? 'NASA sẵn sàng'
            : ephemeris.status === 'ready'
              ? ephemeris.fromCache
                ? 'Horizons cache'
                : 'Horizons live'
              : ephemeris.status === 'loading'
                ? 'Đang tải Horizons'
                : ephemeris.status === 'error'
                  ? 'Fallback mô phỏng'
                  : 'Chưa tải Horizons'}
        </span>
      </div>

      <div className="orbit-mode-row" role="group" aria-label="Kiểu quỹ đạo">
        <button
          type="button"
          className={orbitMode === 'real' ? 'active' : ''}
          onClick={() => setOrbitMode('real')}
          title="Quỹ đạo thật từ NASA/JPL Horizons"
        >
          Real orbit
        </button>
        <button
          type="button"
          className={orbitMode === 'visual' ? 'active' : ''}
          onClick={() => setOrbitMode('visual')}
          title="Quỹ đạo visual dễ nhìn"
        >
          Visual orbit
        </button>
      </div>

      <div className={`timeline-control ${timelineReady ? 'ready' : ''}`}>
        <div>
          <span>Epoch UTC</span>
          <strong>{timelineFormatter.format(new Date(displayedEpoch))}</strong>
        </div>
        <input
          type="range"
          min={timelineReady ? timelineStartMs : 0}
          max={timelineReady ? timelineStopMs : 100}
          step={60 * 60 * 1000}
          value={timelineReady ? displayedEpoch : 0}
          disabled={!timelineReady}
          onChange={(event) => setTimelineEpochMs(Number(event.target.value))}
        />
        <div className="timeline-buttons">
          <button type="button" disabled={!timelineReady} onClick={() => nudgeTimelineDays(-1)} title="Lùi 1 ngày">
            -1d
          </button>
          <button type="button" disabled={!timelineReady} onClick={() => setTimelineEpochMs(Date.now())} title="Về hiện tại">
            Now
          </button>
          <button type="button" disabled={!timelineReady} onClick={() => nudgeTimelineDays(1)} title="Tiến 1 ngày">
            +1d
          </button>
        </div>
      </div>

      <div className="toggle-row icon-toggle-row">
        <button type="button" className={showOrbits ? 'active' : ''} onClick={toggleOrbits} title="Bật/tắt quỹ đạo">
          <Icon type="orbit" />
          <span>Quỹ đạo</span>
        </button>
        <button type="button" className={showLabels ? 'active' : ''} onClick={toggleLabels} title="Bật/tắt nhãn">
          <Icon type="tag" />
          <span>Nhãn</span>
        </button>
        <button
          type="button"
          className={cinematicTour.active ? 'active' : ''}
          onClick={cinematicTour.active ? stopCinematicTour : startCinematicTour}
          title="Tham quan tự động"
        >
          <Icon type="eye" />
          <span>Tham quan</span>
        </button>
        <button type="button" onClick={restartGame} title="Chơi lại">
          <Icon type="reset" />
          <span>Chơi lại</span>
        </button>
      </div>
    </section>
  );
}
