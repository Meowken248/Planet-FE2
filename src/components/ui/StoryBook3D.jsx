import React from 'react';
import { useSolarStore } from '../../store/useSolarStore.js';
import { stories } from '../../data/storyData.js';
import { planetMap } from '../../data/planets.js';
import './StoryBook3D.css';

export default function StoryBook3D() {
  const storyBookOpen = useSolarStore((state) => state.storyBookOpen);
  const closeStoryBook = useSolarStore((state) => state.closeStoryBook);
  const selectedPlanetId = useSolarStore((state) => state.selectedPlanetId);

  const story = stories[selectedPlanetId] || stories.earth;
  const planet = planetMap[selectedPlanetId] || planetMap.earth;

  // Xử lý drop cap tiếng Việt an toàn với chuẩn hóa NFC
  const storyContent = story.content || [];
  const processedParagraphs = storyContent.map(p => (p || '').normalize('NFC'));
  const firstParagraph = processedParagraphs[0] || '';
  const remainingParagraphs = processedParagraphs.slice(1);

  const firstLetter = firstParagraph.slice(0, 1);
  const restOfFirstParagraph = firstParagraph.slice(1);

  return (
    <div className={`storybook-overlay ${storyBookOpen ? 'open' : ''}`} onClick={closeStoryBook}>
      <button type="button" className="close-book-btn" onClick={closeStoryBook} title="Đóng sách">
        &times;
      </button>

      <div className="storybook-wrapper" onClick={(event) => event.stopPropagation()}>
        <div className="book-3d">
          <div className="book-shadow" />

          {/* Left Side Group: Cover backing + Left Page */}
          <div className="book-half left-half">
            <div className="book-cover left-cover">
              <div className="gold-foil-border" />
              <div className="embossed-symbol">&#10059;</div>
            </div>
            
            <section className="book-sheet left-sheet">
              <div className="sketch-container">
                <div className="vintage-frame">
                  <div className="compass-ticks" />
                  <div className="compass-ticks-secondary" />
                  {story.image && (
                    <img src={story.image} alt={story.title} className="planet-sketch" />
                  )}
                </div>
                
                <div className="sketch-caption">
                  <span className="planet-title-vintage">{planet.name}</span>
                  <small className="planet-subtitle-vintage">{planet.subtitle}</small>
                </div>
                
                <dl className="book-facts">
                  <div className="fact-vintage-card">
                    <dt>Đường kính</dt>
                    <dd>{planet.diameter}</dd>
                  </div>
                  <div className="fact-vintage-card">
                    <dt>Khoảng cách</dt>
                    <dd>{planet.distance}</dd>
                  </div>
                  <div className="fact-vintage-card">
                    <dt>Nhiệt độ</dt>
                    <dd>{planet.temperature}</dd>
                  </div>
                </dl>
                
                <span className="page-number">I</span>
              </div>
            </section>
          </div>

          {/* Right Side Group: Cover backing + Right Page */}
          <div className="book-half right-half">
            <div className="book-cover right-cover">
              <div className="gold-foil-border" />
              <div className="embossed-symbol">&#10059;</div>
            </div>

            <section className="book-sheet right-sheet">
              <span className="story-kicker">Biên niên sử hành tinh</span>
              <h2 className="story-title">{story.title ? story.title.normalize('NFC') : ''}</h2>
              
              <div className="story-content">
                {firstParagraph && (
                  <p className="story-paragraph first-paragraph">
                    <span className="drop-cap">{firstLetter}</span>
                    {restOfFirstParagraph}
                  </p>
                )}
                {remainingParagraphs.map((paragraph, index) => (
                  <p key={index} className="story-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <span className="page-number">II</span>
            </section>
          </div>

          {/* Center Spine */}
          <div className="book-spine">
            <div className="spine-ribs" />
          </div>

          {/* Hanging Bookmark Ribbon */}
          <div className="bookmark-ribbon" />
        </div>
      </div>
    </div>
  );
}

