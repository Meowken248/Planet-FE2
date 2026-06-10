import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    let mounted = true;
    let visualProgress = 0;
    const interval = window.setInterval(() => {
      visualProgress = Math.min(92, visualProgress + 2.8);
      if (mounted) setProgress((current) => Math.max(current, visualProgress));
    }, 70);

    const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 2400));
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
    <div className="loading-screen loading-minimal">
      <div className="planet-loader">
        <div className="planet-word" aria-label="Planet">
          {'PLANET'.split('').map((letter, index) => (
            <span key={letter} data-letter={letter} style={{ '--letter-index': index }}>
              {letter}
            </span>
          ))}
        </div>
        <div className="planet-loader-line" aria-label={`Tiến trình ${Math.round(progress)}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
