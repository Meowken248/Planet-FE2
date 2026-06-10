import React, { useEffect, useMemo, useState } from 'react';

const preloadImages = [
  '/planets/sun.jpg',
  '/planets/earth.jpg',
  '/planets/jupiter.jpg',
  '/planets/saturn.jpg',
  '/planets/mars.jpg',
  '/stars.jpg',
];

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const messages = useMemo(
    () => [
      'Đang đồng bộ bản đồ sao',
      'Đang nạp mô hình hành tinh',
      'Đang hiệu chỉnh quỹ đạo',
      'Đang mở cổng không gian',
    ],
    []
  );
  const message = messages[Math.min(messages.length - 1, Math.floor((progress / 100) * messages.length))];

  useEffect(() => {
    let mounted = true;
    let visualProgress = 0;
    const interval = window.setInterval(() => {
      visualProgress = Math.min(92, visualProgress + 2.8);
      if (mounted) setProgress((current) => Math.max(current, visualProgress));
    }, 70);

    const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 1700));
    const assetsReady = Promise.all([
      ...preloadImages.map(loadImage),
      fetch('/models/cassini.glb').catch(() => null),
    ]);

    Promise.all([minimumDelay, assetsReady]).then(() => {
      if (!mounted) return;
      window.clearInterval(interval);
      setProgress(100);
      window.setTimeout(onComplete, 520);
    });

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-stars" />
      <div className="loading-nebula" />
      <div className="loading-scanlines" />
      <div className="loading-portal" aria-hidden="true">
        <div className="loading-core">
          <em />
          <span />
          <i />
          <b />
        </div>
        <div className="loading-beam" />
      </div>
      <div className="loading-hud top">
        <span>SOLARVERSE PRELAUNCH</span>
        <strong>{Math.round(progress)}%</strong>
      </div>
      <div className="loading-copy">
        <p>SolarVerse</p>
        <h1>Chuẩn bị khởi hành</h1>
        <strong>{message}</strong>
        <div className="loading-bar" aria-label={`Tiến trình ${Math.round(progress)}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>NASA DATA | JPL HORIZONS | THREE.JS FLIGHT</small>
      </div>
      <div className="loading-hud bottom">
        <span>ORBIT LOCK</span>
        <span>STAR MAP</span>
        <span>WARP GATE</span>
      </div>
    </div>
  );
}
