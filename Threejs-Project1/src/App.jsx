import React from 'react';
import SolarSystem from './components/scene/SolarSystem.jsx';
import CompareStrip from './components/ui/CompareStrip.jsx';
import ControlPanel from './components/ui/ControlPanel.jsx';
import GameCompletePanel from './components/ui/GameCompletePanel.jsx';
import GameFailedPanel from './components/ui/GameFailedPanel.jsx';
import InfoPanel from './components/ui/InfoPanel.jsx';
import MissionControl from './components/ui/MissionControl.jsx';
import PlanetList from './components/ui/PlanetList.jsx';
import ProgressTracker from './components/ui/ProgressTracker.jsx';
import QuizGamePanel from './components/ui/QuizGamePanel.jsx';
import SpaceshipCursor from './components/ui/SpaceshipCursor.jsx';

export default function App() {
  return (
    <main className="app-shell">
      <SolarSystem />

      <div className="top-bar">
        <div>
          <p>SolarVerse</p>
          <h1>Game khám phá hệ Mặt Trời</h1>
        </div>
        <ControlPanel />
      </div>

      <PlanetList />
      <ProgressTracker />
      <InfoPanel />
      <MissionControl />
      <CompareStrip />
      <QuizGamePanel />
      <GameCompletePanel />
      <GameFailedPanel />
      <SpaceshipCursor />
    </main>
  );
}
