import React, { useEffect, useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore.js';
import { stories } from '../../data/storyData.js';
import './StoryBook3D.css';

export default function StoryBook3D() {
  const storyBookOpen = useSolarStore((state) => state.storyBookOpen);
  const closeStoryBook = useSolarStore((state) => state.closeStoryBook);
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);
  const [flipped, setFlipped] = useState(false);

  const story = stories[selectedPlanetId] || stories.earth;

  useEffect(() => {
    let timer;
    if (storyBookOpen) {
      // Delay flipping until the book has flown into view
      timer = setTimeout(() => {
        setFlipped(true);
      }, 700);
    } else {
      setFlipped(false);
    }
    return () => clearTimeout(timer);
  }, [storyBookOpen]);

  if (!storyBookOpen && !flipped) {
    // We could return null to completely unmount, but keeping it in DOM with opacity 0 is smoother for transitions.
    // We will conditionally unmount if it's fully closed to save memory, but css opacity handles the visibility.
  }

  return (
    <div className={`storybook-overlay ${storyBookOpen ? 'open' : ''}`} onClick={closeStoryBook}>
      <button type="button" className="close-book-btn" onClick={closeStoryBook} title="Đóng sách (hoặc nhấn ra ngoài)">
        &times;
      </button>

      <div className="storybook-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className={`book-3d ${flipped ? 'flipped' : ''}`}>
          
          {/* Back Cover (Never flips, stays on right) */}
          <div className="book-page page-back-cover">
             <div className="book-page-front cover-front"></div>
             <div className="book-page-back cover-back"></div>
          </div>

          {/* Static Content Page (Right Side) */}
          <div className="book-page page-content">
            <div className="book-page-front paper-front">
              <h2 className="story-title">{story.title ? story.title.normalize('NFC') : ''}</h2>
              <div className="story-content">
                {story.content && story.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph ? paragraph.normalize('NFC') : ''}</p>
                ))}
              </div>
            </div>
            <div className="book-page-back paper-back"></div>
          </div>

          {/* Flipping Pages (Dummy paper for effect) */}
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className={`book-page page-flip-${num}`}>
              <div className="book-page-front paper-front"></div>
              <div className="book-page-back paper-back"></div>
            </div>
          ))}

          {/* Top Flipped Page (Lands on the left, shows sketch) */}
          <div className="book-page page-flip-6">
            <div className="book-page-front paper-front"></div>
            <div className="book-page-back paper-back sketch-page">
               <div className="sketch-container">
                 {story.image && <img src={story.image} alt={story.title} className="planet-sketch" />}
                 <p className="sketch-caption">Bản khắc cổ đại - Khám phá hệ Mặt Trời</p>
               </div>
            </div>
          </div>

          {/* Cover Page */}
          <div className="book-page page-cover">
            <div className="book-page-front cover-front">
              <h1>Truyền Thuyết</h1>
              <p>Biên niên sử Hệ Mặt Trời</p>
            </div>
            <div className="book-page-back cover-back"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
