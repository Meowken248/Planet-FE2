import React, { useCallback, useEffect, useRef, useState } from 'react';
import './intro-dashboard.css';

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4';

const missionVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4';

const solutionVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4';
const ctaVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

const planets = [
  ['Sao Thủy', 'Nhanh nhất', 'Thế giới đá sát Mặt Trời, đầy miệng hố và nhiệt độ cực đoan.', '/planets/mercury.jpg'],
  ['Sao Kim', 'Nóng nhất', 'Mây axit, khí quyển dày và hiệu ứng nhà kính dữ dội.', '/venus/map.jpg'],
  ['Trái Đất', 'Có sự sống', 'Đại dương, mây, khí quyển và sinh quyển xanh của chúng ta.', '/earth/map.jpg'],
  ['Sao Hỏa', 'Hành tinh đỏ', 'Bụi sắt, núi lửa cổ và dấu vết nước từng chảy qua.', '/planets/mars.jpg'],
  ['Sao Mộc', 'Lớn nhất', 'Vua bão khí khổng lồ với Vết Đỏ Lớn và nhiều mặt trăng.', '/planets/jupiter.jpg'],
  ['Sao Thổ', 'Vành đai', 'Một sân khấu băng đá khổng lồ xoay quanh hành tinh khí.', '/planets/saturn.jpg'],
  ['Thiên Vương', 'Nghiêng ngang', 'Hành tinh băng xanh nhạt lăn quanh Mặt Trời theo trục lạ.', '/planets/uranus.jpg'],
  ['Hải Vương', 'Gió mạnh', 'Rìa xanh sâu với những cơn gió siêu nhanh và bão lạnh.', '/planets/neptune.jpg'],
];

const features = [
  ['profile', 'Hồ sơ hành tinh', 'Đọc dữ liệu, mô tả, dấu hiệu nổi bật và thông tin NASA theo từng hành tinh.'],
  ['camera', 'Camera điện ảnh', 'Bấm hành tinh, camera lia tới trước khi mở hồ sơ riêng.'],
  ['mission', 'Nhiệm vụ game', 'Mỗi hành tinh có màu nền, quái, boss và độ khó riêng.'],
  ['orbit', 'Trải nghiệm 3D', 'Quỹ đạo, bề mặt, ánh sáng và chuyển động tạo cảm giác như phòng chiếu thiên văn.'],
];

function FeatureIcon({ type }) {
  const paths = {
    profile: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M8.5 15.5c1.2-1.3 2.3-2 3.5-2s2.3.7 3.5 2" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h4l1.3-2h5.4L16 8h4v10H4z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    mission: (
      <>
        <path d="M12 3l3 6 6 .8-4.5 4.3 1.1 6.1L12 17.2 6.4 20.2l1.1-6.1L3 9.8 9 9z" />
      </>
    ),
    orbit: (
      <>
        <circle cx="12" cy="12" r="2.2" />
        <path d="M3.5 12c0-3.6 3.8-6.5 8.5-6.5s8.5 2.9 8.5 6.5-3.8 6.5-8.5 6.5S3.5 15.6 3.5 12Z" />
        <path d="M6.5 6.5c3.2 3.9 7.6 7.5 11 11" />
      </>
    ),
  };

  return (
    <span className="mind-feature-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </svg>
    </span>
  );
}

function PlanetCard({ planet, index, onRevealMove }) {
  return (
    <article className="mind-planet-card" style={{ '--card-index': index }} onPointerMove={onRevealMove}>
      <div className="mind-planet-icon" style={{ backgroundImage: `url(${planet[3]})` }}>
        {planet[0] === 'Sao Thổ' && <i />}
      </div>
      <h3>{planet[0]}</h3>
      <strong>{planet[1]}</strong>
      <p>{planet[2]}</p>
    </article>
  );
}

export default function IntroExperience({ onStart }) {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 38 });
  const missionText =
    'Chúng tôi xây dựng một không gian nơi tò mò gặp rõ ràng, nơi mỗi hành tinh có hồ sơ riêng, mỗi nhiệm vụ có nhịp chơi riêng và mỗi lần lướt xuống mở ra một lớp vũ trụ mới.';
  const secondText =
    'Ít nhiễu hơn, nhiều chiều sâu hơn, nhiều chuyển động hơn để người chơi hiểu Hệ Mặt Trời bằng cả mắt, tay và trí tưởng tượng.';
  const ctaVideoRef = useRef(null);

  useEffect(() => {
    const video = ctaVideoRef.current;
    if (!video) return;
    video.play?.().catch(() => {});
  }, []);

  const handlePointerMove = useCallback((event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    setSpotlight({ x, y });
  }, []);

  const handleLocalReveal = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--local-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty('--local-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  return (
    <main
      className="mind-home"
      id="home"
      onPointerMove={handlePointerMove}
      style={{ '--spotlight-x': `${spotlight.x}%`, '--spotlight-y': `${spotlight.y}%` }}
    >
      <nav className="mind-nav">
        <a className="mind-logo" href="#home">
          <span><i /></span>
          <strong>SolarVerse</strong>
        </a>
        <div className="mind-links">
          <a href="#home">Home</a>
          <b>•</b>
          <a href="#planets">How It Works</a>
          <b>•</b>
          <a href="#mission">Philosophy</a>
          <b>•</b>
          <a href="#cta">Use Cases</a>
        </div>
      </nav>

      <section className="mind-hero">
        <video className="mind-hero-video mind-hero-video-base" src={heroVideo} autoPlay loop muted playsInline />
        <video className="mind-hero-video mind-hero-video-color" src={heroVideo} autoPlay loop muted playsInline />
        <div className="mind-hero-fade" />
        <div className="mind-hero-content">
          <div className="mind-avatar-row">
            <span />
            <span />
            <span />
            <p>7,000+ explorers already launched</p>
          </div>
          <h1>
            Get <em>Inspired</em> with Space
          </h1>
          <p className="mind-subtitle">
            Khám phá các hành tinh, hồ sơ 3D, nhiệm vụ game và một hành trình đi từ Trái Đất tới rìa Hệ Mặt Trời.
          </p>
        </div>
      </section>

      <section className="mind-search" id="planets">
        <h2>
          Exploration has <em>changed.</em>
          <br />
          Have you?
        </h2>
        <p>
          Mỗi hành tinh trong SolarVerse không chỉ là một quả cầu quay. Nó là một hồ sơ, một nhiệm vụ và một thế giới có cá tính riêng.
        </p>
        <div className="mind-planet-grid">
          {planets.map((planet, index) => (
            <PlanetCard key={planet[0]} planet={planet} index={index} onRevealMove={handleLocalReveal} />
          ))}
        </div>
        <small>If you do not explore the questions, the universe keeps them.</small>
      </section>

      <section className="mind-mission" id="mission">
        <div className="mind-video-reveal mind-video-orb" onPointerMove={handleLocalReveal}>
          <video className="mind-video-base" src={missionVideo} autoPlay loop muted playsInline />
          <video className="mind-video-color" src={missionVideo} autoPlay loop muted playsInline />
        </div>
        <div className="mind-word-block">
          <p>{missionText}</p>
          <p>{secondText}</p>
        </div>
      </section>

      <section className="mind-solution">
        <span>SOLUTION</span>
        <h2>
          The platform for <em>meaningful</em> planetary play
        </h2>
        <div className="mind-feature-grid">
          {features.map(([icon, title, description]) => (
            <article key={title}>
              <FeatureIcon type={icon} />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mind-cta" id="cta">
        <video className="mind-cta-video-base" ref={ctaVideoRef} src={ctaVideo} autoPlay loop muted playsInline />
        <video className="mind-cta-video-color" src={ctaVideo} autoPlay loop muted playsInline />
        <div className="mind-cta-overlay" />
        <div className="mind-cta-content">
          <span className="mind-logo-mark"><i /></span>
          <h2>
            Start Your <em>Journey</em>
          </h2>
          <p>Nhấn nút xuyên không để rời landing page và bước vào mô phỏng Hệ Mặt Trời 3D.</p>
          <div className="mind-cta-actions">
            <button type="button" className="warp-button" onClick={onStart}>
              Xuyên không
            </button>
            <a className="liquid-glass" href="#planets">Xem hành tinh</a>
          </div>
        </div>
      </section>

    </main>
  );
}
