import React, { useState, useEffect, useRef } from 'react';
import './AnimatedSlider.css';
import PokemonStats from './PokemonStats';
import EvolutionPath from './EvolutionPath';
import PokemonDescription from './PokemonDescription';
import { normalizePokemonName } from '../utils/normalizePokemonName';
import { typeColorsLight, typeColorsHalf } from '../utils/typeColors';
import jaPokemonNames from '../utils/jaPokemonNames.json';

const AnimatedSlider = ({ items, onFilterType, onActiveChange, onPokemonClick, active: propActive }) => {
  const [active, setActive] = useState(propActive || 0);

  const [startPosition, setStartPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const swipeThreshold = 6;

  const [showStats, setShowStats] = useState(false);
  const [showEvolutions, setShowEvolutions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const itemRefs = useRef([]);

  // 🆕 Limit visible items to just 5 around the current active index
  const windowSize = 4;
  const start = Math.max(active - windowSize, 0);
  const end = Math.min(active + windowSize + 1, items.length);
  const visibleItems = items.slice(start, end);

  useEffect(() => {
    setActive(propActive);
  }, [propActive]);

  useEffect(() => {
    loadShow();
    onActiveChange(active);

    setShowStats(false);
    setShowEvolutions(false);
    setShowDescription(false);

    const statsTimeout = setTimeout(() => setShowStats(true), 300);
    const evolutionsTimeout = setTimeout(() => setShowEvolutions(true), 1000);
    const descriptionTimeout = setTimeout(() => setShowDescription(true), 300);

    return () => {
      clearTimeout(statsTimeout);
      clearTimeout(evolutionsTimeout);
      clearTimeout(descriptionTimeout);
    };
  }, [active, items]);

  useEffect(() => {
    setActive(0);
  }, [items]);

  useEffect(() => {
    loadShow();
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  const handleStart = (e) => {
    e.preventDefault();
    const posX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    const posY = e.type === 'mousedown' ? e.pageY : e.touches[0].pageY;
    setStartPosition({ x: posX, y: posY });
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging || startPosition.x === null || startPosition.y === null) return;
    const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
    const currentY = e.type === 'mousemove' ? e.pageY : e.touches[0].pageY;
    const diffX = currentX - startPosition.x;
    const diffY = currentY - startPosition.y;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      e.preventDefault();
    }
  };

  const handleEnd = (e) => {
    if (!isDragging || startPosition.x === null) return;
    const endX = e.type === 'mouseup' ? e.pageX : e.changedTouches[0].pageX;
    const endY = e.type === 'mouseup' ? e.pageY : e.changedTouches[0].pageY;
    const diffX = endX - startPosition.x;
    const diffY = endY - startPosition.y;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      e.preventDefault();
      if (diffX > 0) prev();
      else next();
    }

    setIsDragging(false);
    setStartPosition({ x: null, y: null });
  };

  const loadShow = () => {
    if (!itemRefs.current) return;
    visibleItems.forEach((_, index) => {
      const actualIndex = start + index;
      const ref = itemRefs.current[actualIndex];
      if (!ref) return;

      if (actualIndex === active) {
        ref.style.transform = 'translateX(0)';
        ref.style.zIndex = 1;
        ref.style.filter = 'none';
        ref.style.opacity = 1;
      } else {
        const offset = actualIndex - active;
        const translateX = offset * 200;
        const scale = 1 - 0.2 * Math.abs(offset);
        ref.style.transform = `translateX(${translateX}px) scale(${scale})`;
        ref.style.zIndex = -Math.abs(offset);
        ref.style.filter = 'blur(8px)';
        ref.style.opacity = Math.abs(offset) > 2 ? 0 : 0.6;
      }
    });
  };

  const next = () => {
    if (active < items.length - 1) setActive(active + 1);
  };

  const prev = () => {
    if (active > 0) setActive(active - 1);
  };

  return (
    <div className="slider">
      <div
        className="items"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = start + index;
          const isActive = actualIndex === active;
          const backgroundColor = typeColorsLight[item.types[0].type.name];
          const borderColor = typeColorsHalf[item.types[0].type.name];
          const japaneseNameEntry = jaPokemonNames.find(p => p.id === item.id);
          const japaneseName = japaneseNameEntry ? japaneseNameEntry.name : '';
          const normalizedName = normalizePokemonName(item.name);

          return (
            <div
              key={actualIndex}
              className={`item ${isActive ? 'active' : ''}`}
              ref={(el) => (itemRefs.current[actualIndex] = el)}
              style={{
                backgroundColor,
                borderColor,
                visibility: item.isImageLoaded ? 'visible' : 'hidden',
              }}
            >
              <div className="top-info">
                <p id="number"><span>#</span>{item.id.toString().padStart(3, '0')}</p>
                <p id="hp"><span>HP</span>{item.stats[0].base_stat}</p>
              </div>
              <div className="names">
                <h3 className="name">{normalizedName}</h3>
                {japaneseName && <h4 className="jap-name">{japaneseName}</h4>}
              </div>
              <div className="types">
                {item.types.map((type) => (
                  <span
                    key={type.type.name}
                    className="type"
                    style={{ backgroundColor: typeColorsHalf[type.type.name] }}
                    onClick={isActive ? () => onFilterType(type.type.name) : null}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
              <div className='pokebox'>
                <img
                  className="pokeimg"
                  src={item.spriteUrl}
                  alt={item.name}
                  style={{
                    animation: isActive ? 'pokemonAnimation 2.5s infinite linear' : null,
                    visibility: item.isImageLoaded ? 'visible' : 'hidden',
                  }}
                />
              </div>
              <div className="info">
                <div className="pokeinfo fade">
                  {isActive && showStats && <PokemonStats stats={item.stats} types={item.types} pokemonName={item.name} />}
                  {isActive && showDescription && <PokemonDescription pokemonId={item.id} types={item.types} />}
                </div>
                <div className="fade">
                  {isActive && showEvolutions && (
                    <EvolutionPath pokemonId={item.id} onPokemonClick={onPokemonClick} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="buttons">
        <button id="prev" className="ArrowLeft" onClick={prev} style={{ visibility: active > 0 ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
          </svg>
        </button>
        <button id="next" className="ArrowRight" onClick={next} style={{ visibility: active < items.length - 1 ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AnimatedSlider;
