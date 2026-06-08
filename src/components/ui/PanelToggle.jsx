import React from 'react';
import { useSolarStore } from '../../store/useSolarStore.js';

export default function PanelToggle({ panelId, title, meta }) {
  const collapsed = useSolarStore((state) => state.collapsedPanels[panelId]);
  const togglePanel = useSolarStore((state) => state.togglePanel);

  return (
    <button
      type="button"
      className="panel-toggle"
      aria-expanded={!collapsed}
      onClick={() => togglePanel(panelId)}
      title={collapsed ? 'Mở bảng' : 'Thu bảng'}
    >
      <span>{title}</span>
      {meta && <strong>{meta}</strong>}
      <i aria-hidden="true" />
    </button>
  );
}
