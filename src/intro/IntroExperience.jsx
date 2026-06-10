import React, { useCallback, useEffect, useRef, useState } from 'react';
import './intro-dashboard.css';

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4';

const missionVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4';

const solutionVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4';

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
  ['Hồ sơ hành tinh', 'Đọc dữ liệu, mô tả, dấu hiệu nổi bật và thông tin NASA theo từng hành tinh.'],
  ['Camera điện ảnh', 'Bấm hành tinh, camera lia tới trước khi mở hồ sơ riêng.'],
  ['Nhiệm vụ game', 'Mỗi hành tinh có màu nền, quái, boss và độ khó riêng.'],
  ['Trải nghiệm 3D', 'Quỹ đạo, bề mặt, ánh sáng và chuyển động tạo cảm giác như phòng chiếu thiên văn.'],
];

function useRevealWords(text) {
  return text.split(' ').map((word, index) => (
    <span key={`${word}-${index}`} style={{ '--word-index': index }}>
      {word}
    </span>
  ));
}

function SocialIcon({ label }) {
  return (
    <a className="mind-social liquid-glass" href="#home" aria-label={label}>
      {label.slice(0, 1)}
    </a>
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
  const [email, setEmail] = useState('');
  const [spotlight, setSpotlight] = useState({ x: 50, y: 38 });
  const missionText = useRevealWords(
    'Chúng tôi xây dựng một không gian nơi tò mò gặp rõ ràng, nơi mỗi hành tinh có hồ sơ riêng, mỗi nhiệm vụ có nhịp chơi riêng và mỗi lần lướt xuống mở ra một lớp vũ trụ mới.'
  );
  const secondText = useRevealWords(
    'Ít nhiễu hơn, nhiều chiều sâu hơn, nhiều chuyển động hơn để người chơi hiểu Hệ Mặt Trời bằng cả mắt, tay và trí tưởng tượng.'
  );
  const ctaVideoRef = useRef(null);

  useEffect(() => {
    const video = ctaVideoRef.current;
    if (!video) return;
    video.play?.().catch(() => {});
  }, []);

  const handleSubscribe = useCallback((event) => {
    event.preventDefault();
    setEmail('');
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
        <div className="mind-socials">
          <SocialIcon label="Instagram" />
          <SocialIcon label="Linkedin" />
          <SocialIcon label="Twitter" />
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
          <form className="mind-form liquid-glass" onSubmit={handleSubscribe}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="your@email.com"
            />
            <button type="submit">SUBSCRIBE</button>
          </form>
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
        <div className="mind-video-reveal mind-video-wide" onPointerMove={handleLocalReveal}>
          <video className="mind-video-base" src={solutionVideo} autoPlay loop muted playsInline />
          <video className="mind-video-color" src={solutionVideo} autoPlay loop muted playsInline />
        </div>
        <div className="mind-feature-grid">
          {features.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mind-cta" id="cta">
        <video className="mind-cta-video-base" ref={ctaVideoRef} src={solutionVideo} autoPlay loop muted playsInline />
        <video className="mind-cta-video-color" src={solutionVideo} autoPlay loop muted playsInline />
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

      <footer className="mind-footer">
        <p>© 2026 SolarVerse. All rights reserved.</p>
        <div>
          <a href="#home">Privacy</a>
          <a href="#home">Terms</a>
          <a href="#home">Contact</a>
        </div>
      </footer>
    </main>
  );
}
