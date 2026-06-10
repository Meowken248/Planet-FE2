import React, { useCallback, useEffect, useRef, useState } from 'react';
import SolarSystem from './components/scene/SolarSystem.jsx';
import CompareStrip from './components/ui/CompareStrip.jsx';
import ControlPanel from './components/ui/ControlPanel.jsx';
import GameCompletePanel from './components/ui/GameCompletePanel.jsx';
import GameFailedPanel from './components/ui/GameFailedPanel.jsx';
import MissionControl from './components/ui/MissionControl.jsx';
import PlanetShooterGame from './components/missions/PlanetShooterGame.jsx';
import PlanetProfilePage from './components/pages/PlanetProfilePage.jsx';
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
  const backgroundAudioRef = useRef(null);
  const [path, setPath] = useState(window.location.pathname);
  const [phase, setPhase] = useState('loading');
  const uiVisible = useSolarStore((state) => state.uiVisible);
  const toggleUI = useSolarStore((state) => state.toggleUI);
  const profileMatch = path.match(/^\/planet\/([^/]+)$/);
  const profilePlanetId = profileMatch?.[1] || null;
  const isProfilePage = Boolean(profilePlanetId);
  const showMainApp = phase === 'main';

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    if (phase === 'loading') return undefined;

    const audio = backgroundAudioRef.current;
    if (!audio) return undefined;

    audio.volume = 0.35;
    audio.loop = true;

    const playAudio = () => {
      audio.play().catch(() => {
        // Browsers can block autoplay until the first user interaction.
      });
    };

    playAudio();
    window.addEventListener('pointerdown', playAudio, { once: true });
    window.addEventListener('keydown', playAudio, { once: true });
    window.addEventListener('touchstart', playAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', playAudio);
      window.removeEventListener('keydown', playAudio);
      window.removeEventListener('touchstart', playAudio);
    };
  }, [phase]);

  const finishLoading = useCallback(() => {
    setPhase(isProfilePage ? 'main' : 'intro');
  }, [isProfilePage]);

  const enterSolarSystem = useCallback(() => {
    setPhase('warp');
    window.setTimeout(() => setPhase('main'), 3500);
  }, []);

  return (
    <>
      {phase === 'loading' && <LoadingScreen onComplete={finishLoading} />}
      <audio ref={backgroundAudioRef} src="/audio/bgaudio.m4a" preload="auto" loop />
      {phase === 'intro' && <IntroExperience onStart={enterSolarSystem} />}
      {showMainApp && isProfilePage && <PlanetProfilePage planetId={profilePlanetId} />}

      <main className={`app-shell ${showMainApp && !isProfilePage ? 'is-live' : 'is-hidden-shell'}`}>
        {showMainApp && !isProfilePage && <SolarSystem />}

        {showMainApp && !isProfilePage && (
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

        {showMainApp && !isProfilePage && (
          <div className={`ui-container ${uiVisible ? '' : 'hidden'}`}>
            <div className="top-bar">
              <div>
                <p>SolarVerse</p>
              </div>
              <ControlPanel />
            </div>

            <PlanetList />
            <ProgressTracker />
            <MissionControl />
            <CompareStrip />
          </div>
        )}

      </main>

      {showMainApp && <QuizGamePanel />}
      {showMainApp && <GameCompletePanel />}
      {showMainApp && <GameFailedPanel />}
      {showMainApp && <StoryBook3D />}
      {showMainApp && <PlanetShooterGame />}

      {phase !== 'loading' && <SpaceshipCursor />}
    </>
  );
}
