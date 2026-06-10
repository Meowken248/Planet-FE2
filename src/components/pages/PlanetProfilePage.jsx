import React, { useEffect } from 'react';
import { planetMap } from '../../data/planets.js';
import { useSolarStore } from '../../store/useSolarStore.js';
import { planetShooterConfig } from '../missions/planetShooterConfig.js';
import SurfacePreview from '../ui/SurfacePreview.jsx';

const profileCodes = {
  mercury: 'MR-01',
  venus: 'VN-02',
  earth: 'ER-03',
  mars: 'MS-04',
  jupiter: 'JP-05',
  saturn: 'ST-06',
  uranus: 'UR-07',
  neptune: 'NP-08',
};

const goHome = () => {
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4';

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  if (name === 'download') {
    return (
      <svg {...common}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
      </svg>
    );
  }

  if (name === 'sparkles') {
    return (
      <svg {...common}>
        <path d="M9.9 2.6 8.4 7.1 4 8.6l4.4 1.5 1.5 4.5 1.5-4.5 4.4-1.5-4.4-1.5z" />
        <path d="m18 13 1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
      </svg>
    );
  }

  if (name === 'wand') {
    return (
      <svg {...common}>
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M8 9H6" />
        <path d="M20 9h-2" />
        <path d="m17.8 6.2 1.4-1.4" />
        <path d="m10.8 13.2-1.4 1.4" />
        <path d="m17.8 11.8 1.4 1.4" />
        <path d="m10.8 4.8-1.4-1.4" />
        <path d="m3 21 9-9" />
      </svg>
    );
  }

  if (name === 'book') {
    return (
      <svg {...common}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  if (name === 'menu') {
    return (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    );
  }

  if (name === 'arrow') {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 5 7 7-7 7" />
      </svg>
    );
  }

  if (name === 'plus') {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function PlanetProfilePage({ planetId }) {
  const planet = planetMap[planetId] || planetMap.earth;
  const shooter = planetShooterConfig[planet.id] || planetShooterConfig.earth;
  const missionData = shooter.mission || {};
  const mission = useSolarStore((state) => state.mission);
  const selectPlanet = useSolarStore((state) => state.selectPlanet);
  const openStoryBook = useSolarStore((state) => state.openStoryBook);
  const openQuiz = useSolarStore((state) => state.openQuiz);
  const openShooterMission = useSolarStore((state) => state.openShooterMission);

  useEffect(() => {
    selectPlanet(planet.id);
  }, [planet.id, selectPlanet]);

  const isMissionTarget = mission.status === 'scan' && mission.targetId === planet.id;
  const scanProgress = isMissionTarget ? 100 : mission.targetId === planet.id ? Math.round(mission.progress * 100) : 34;

  return (
    <main className={`planet-profile-page ${planet.id}`}>
      <video className="profile-video-bg" src={heroVideo} autoPlay loop muted playsInline />
      <div className="profile-video-shade" />

      <section className="planet-profile-hero">
        <div className="profile-left-panel">
          <div className="liquid-glass-strong profile-panel-glass" />

          <nav className="profile-nav">
            <button type="button" className="profile-brand" onClick={goHome}>
              <span className={`planet-orb ${planet.id}`} />
              <strong>PLANE</strong>
            </button>
            <button type="button" className="profile-menu-btn liquid-glass" onClick={goHome}>
              <Icon name="back" />
              Hệ hành tinh
            </button>
          </nav>

          <div className="profile-hero-copy">
            <span className={`profile-hero-orb planet-orb ${planet.id}`} />
            <p className="profile-kicker">{profileCodes[planet.id]} / {isMissionTarget ? 'Đã quét' : 'Hồ sơ hành tinh'}</p>
            <h1>
              Khám phá <em>{planet.name}</em> qua nhiệm vụ không gian
            </h1>
            <p>{planet.description}</p>
            <button type="button" className="profile-primary-cta liquid-glass-strong" onClick={openShooterMission}>
              Khám phá nhiệm vụ ngay

            </button>

            <div className="profile-secondary-actions">
              <button type="button" className="liquid-glass" onClick={openStoryBook}>
                <Icon name="book" />
                Kể chuyện
              </button>
              <button type="button" className="liquid-glass" onClick={openQuiz}>
                <Icon name="sparkles" />
                Thử thách
              </button>
            </div>

            <div className="profile-pill-row">
              <span className="liquid-glass">Hành tinh 3D</span>
              <span className="liquid-glass">Game bắn ngang</span>
              <span className="liquid-glass">Dữ liệu NASA</span>
            </div>
          </div>

          <div className="profile-quote">
            <span>VISIONARY ORBIT</span>
            <p>Chúng ta không chỉ nhìn một hành tinh. <em>Chúng ta bước vào câu chuyện của nó.</em></p>
            <strong><i /> SOLARVERSE MISSION <i /></strong>
          </div>
        </div>

        <aside className="profile-right-panel">
          <div className="profile-social-row">

            <button type="button" className="profile-icon-btn liquid-glass" aria-label="Mission AI">
              <Icon name="sparkles" />
            </button>
          </div>

          <div className="profile-community-card liquid-glass">
            <strong>{shooter.title}</strong>
            <p>{shooter.subtitle}</p>
          </div>

          <div className="planet-profile-visual">
            <SurfacePreview planet={planet} />
          </div>

          <div className="profile-feature-dock liquid-glass-strong">
            <div className="profile-mini-grid">
              <div className="profile-mini-card liquid-glass">
                <span className="profile-icon-circle"><Icon name="wand" /></span>
                <strong>Processing</strong>
                <p>{scanProgress}% phân tích dữ liệu quỹ đạo.</p>
              </div>
              <div className="profile-mini-card liquid-glass">
                <span className="profile-icon-circle"><Icon name="book" /></span>
                <strong>Growth Archive</strong>
                <p>{planet.facts[0]} / {planet.facts[1]}</p>
              </div>
            </div>

            <div className="profile-game-card liquid-glass">
              <div className="profile-game-thumb">
                <img src={shooter.background} alt="" />
              </div>
              <div>
                <strong>{shooter.bossName}</strong>
                <p>
                  Nhiệm vụ {shooter.terrain}: hạ {shooter.enemyLabel}, sống sót {missionData.timeLimit}s,
                  mục tiêu {missionData.targetKills} quái và {missionData.targetScore} điểm.
                </p>
              </div>
              <button type="button" onClick={openShooterMission} aria-label="Mở nhiệm vụ">
                <Icon name="plus" />
              </button>
            </div>
          </div>
        </aside>

        <article className="profile-data-panel liquid-glass-strong">
          <div className="profile-section-title">Dữ liệu hành tinh</div>
          <dl className="planet-stats profile-stats">
            <div>
              <dt>Đường kính</dt>
              <dd>{planet.diameter}</dd>
            </div>
            <div>
              <dt>Bán kính NASA</dt>
              <dd>{planet.nasa.meanRadiusKm.toLocaleString('vi-VN')} km</dd>
            </div>
            <div>
              <dt>Ngày</dt>
              <dd>{planet.day}</dd>
            </div>
            <div>
              <dt>Nghiêng trục</dt>
              <dd>{planet.nasa.axialTiltDeg.toLocaleString('vi-VN')}°</dd>
            </div>
            <div>
              <dt>Năm</dt>
              <dd>{planet.year}</dd>
            </div>
            <div>
              <dt>Khoảng cách</dt>
              <dd>{planet.distance}</dd>
            </div>
            <div>
              <dt>Nhiệt độ</dt>
              <dd>{planet.temperature}</dd>
            </div>
          </dl>

          <div className="profile-section-title">Dấu hiệu nổi bật</div>
          <div className="fact-row profile-facts">
            {planet.facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>

          <div className="info-actions">
            <button type="button" className="action-btn mission-game-btn" onClick={openShooterMission}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 16c-1 2-2 3-4 4 1-3 1-5 3-7" />
                <path d="M9 15 4 10l5-2 5-5 7 7-5 5-2 5z" />
                <path d="m15 9-6 6" />
              </svg>
              Hoàn thành nhiệm vụ
            </button>
            <button type="button" className="action-btn story-btn" onClick={openStoryBook}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Kể chuyện
            </button>
            <button type="button" className="action-btn quiz-btn" onClick={openQuiz}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Thử thách
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
