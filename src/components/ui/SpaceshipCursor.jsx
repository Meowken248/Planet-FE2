import React from 'react';
import { useEffect, useRef } from 'react';

const trailCount = 14;

export default function SpaceshipCursor() {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const points = useRef(
    Array.from({ length: trailCount }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }))
  );

  useEffect(() => {
    let frameId;

    const handleMove = (event) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
    };

    const animate = () => {
      const cursor = cursorRef.current;

      if (cursor) {
        cursor.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) rotate(42deg)`;
      }

      points.current.forEach((point, index) => {
        const leader = index === 0 ? mouse.current : points.current[index - 1];
        point.x += (leader.x - point.x) * (0.46 - index * 0.025);
        point.y += (leader.y - point.y) * (0.46 - index * 0.025);

        const node = trailRefs.current[index];
        if (node) {
          const scale = 1 - index / trailCount;
          node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) scale(${scale})`;
          node.style.opacity = String(Math.max(0, 0.34 - index * 0.055));
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handleMove);
    animate();

    return () => {
      window.removeEventListener('pointermove', handleMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="spaceship-cursor" aria-hidden="true">
      {Array.from({ length: trailCount }).map((_, index) => (
        <span
          key={index}
          className="cursor-trail-dot"
          ref={(node) => {
            trailRefs.current[index] = node;
          }}
        />
      ))}
      <span ref={cursorRef} className="cursor-ship">
        <svg viewBox="0 0 36 36" role="img">
          <path d="M18 2.8 21.8 13.5 33.2 13.8 24.1 20.7 27.4 31.6 18 25.1 8.6 31.6 11.9 20.7 2.8 13.8 14.2 13.5 18 2.8Z" fill="#fff6d6" />
          <path d="M18 7.6 20.2 15.2 28 15.4 21.8 20.2 24 27.6 18 23.2 12 27.6 14.2 20.2 8 15.4 15.8 15.2 18 7.6Z" fill="#86e5ff" opacity="0.72" />
          <circle cx="18" cy="18" r="3.2" fill="#ffffff" />
        </svg>
      </span>
    </div>
  );
}
