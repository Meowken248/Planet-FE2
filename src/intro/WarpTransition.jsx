import React from 'react';

export default function WarpTransition({ active }) {
  return (
    <div className={`warp-transition ${active ? 'active' : ''}`} aria-hidden={!active}>
      <div className="warp-lines" />
      <div className="warp-core" />
      <div className="warp-flash" />
    </div>
  );
}
