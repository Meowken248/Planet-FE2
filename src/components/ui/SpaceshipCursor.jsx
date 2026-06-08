import React from 'react';
import { useEffect, useRef } from 'react';

const trailCount = 9;

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
        <svg viewBox="0 0 32 32" role="img">
          <path
            d="M16 2 27 29 16 23 5 29 16 2Z"
            fill="#eef8ff"
            stroke="#73d8ff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M16 7 20 22 16 20 12 22 16 7Z" fill="#2d7dff" opacity="0.9" />
          <circle cx="16" cy="16" r="2.6" fill="#ffcf66" />
        </svg>
      </span>
    </div>
  );
}
