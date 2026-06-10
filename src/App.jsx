import React, { useCallback, useState } from 'react';
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
import StoryBook3D from './components/ui/StoryBook3D.jsx';
import SpaceshipCursor from './components/ui/SpaceshipCursor.jsx';
import IntroExperience from './intro/IntroExperience.jsx';
import LoadingScreen from './intro/LoadingScreen.jsx';
import WarpTransition from './intro/WarpTransition.jsx';

import { useSolarStore } from './store/useSolarStore.js';

export default function App() {
  const [phase, setPhase] = useState('loading');
  const uiVisible = useSolarStore((state) => state.uiVisible);
  const toggleUI = useSolarStore((state) => state.toggleUI);
  const showMainApp = phase === 'main';

  const finishLoading = useCallback(() => {
    setPhase('intro');
  }, []);

  const enterSolarSystem = useCallback(() => {
    setPhase('warp');
    window.setTimeout(() => setPhase('main'), 950);
  }, []);

  return (
    <>
      {phase === 'loading' && <LoadingScreen onComplete={finishLoading} />}
      {phase === 'intro' && <IntroExperience onStart={enterSolarSystem} />}
      <WarpTransition active={phase === 'warp'} />

      <main className={`app-shell ${showMainApp ? 'is-live' : 'is-hidden-shell'}`}>
        {showMainApp && <SolarSystem />}

        {showMainApp && (
          <button
            className={`ui-toggle-btn ${uiVisible ? '' : 'is-hidden'}`}
            onClick={toggleUI}
            title={uiVisible ? "Ẩn giao diện" : "Hiện giao diện"}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {uiVisible ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        )}

        {showMainApp && (
          <div className={`ui-container ${uiVisible ? '' : 'hidden'}`}>
            <div className="top-bar">
              <div>
                <p>SolarVerse</p>
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
          </div>
        )}

        {showMainApp && <StoryBook3D />}
        {phase !== 'loading' && <SpaceshipCursor />}
      </main>
    </>
  );
}
