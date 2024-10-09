import React, { useState, useEffect, useRef } from 'react';
import './AnimatedSlider.css';
import PokemonStats from './PokemonStats';
import EvolutionPath from './EvolutionPath';
import PokemonDescription from './PokemonDescription';
import { normalizePokemonName } from '../utils/normalizePokemonName';
import { typeColorsLight } from '../utils/typeColors';
import { typeColorsHalf } from '../utils/typeColors';
import jaPokemonNames from '../utils/jaPokemonNames.json'

const AnimatedSlider = ({ items, onFilterType, onActiveChange, onPokemonClick, active: propActive }) => {
  const [active, setActive] = useState(propActive || 0);

  const [startPosition, setStartPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const swipeThreshold = 1; // Minimum distance for a swipe to be registered
  const wheelTimeoutRef = useRef(null); // For debouncing the wheel event

  const [showStats, setShowStats] = useState(false);
  const [showEvolutions, setShowEvolutions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const [isFading, setIsFading] = useState(false);
  const itemRefs = useRef([]);
  const fadeTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  

  useEffect(() => {
    setActive(propActive);
  }, [propActive]);

  useEffect(() => {
    loadShow();
    onActiveChange(active); // Notify parent about the active index change
    
    setShowStats(false);
    setShowEvolutions(false);
    setShowDescription(false);
    resetIdleTimer();

    const statsTimeout = setTimeout(() => setShowStats(true), 300);
    const evolutionsTimeout = setTimeout(() => setShowEvolutions(true), 1000);
    const descriptionTimeout = setTimeout(() => setShowDescription(true), 300);

    return () => {
      clearTimeout(statsTimeout);
      clearTimeout(evolutionsTimeout);
      clearTimeout(descriptionTimeout);
      clearTimeout(fadeTimeoutRef.current);
      clearTimeout(idleTimeoutRef.current);
    };
  }, [active, items]);

  useEffect(() => {
    setActive(0); // Reset active state to 0 whenever items change
  }, [items]);

  useEffect(() => {
    loadShow();
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', resetIdleTimer);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', resetIdleTimer);
    };
  }, [active]);


  // Touch and mouse event hendlers for swiping to next and prev card
  const handleStart = (e) => {
    const pos = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    setStartPosition(pos);
    setIsDragging(true);
  };

  const handleEnd = (e) => {
    if (!isDragging || startPosition === null) return;

    const endPosition = e.type === 'mouseup' ? e.pageX : e.changedTouches[0].pageX;
    const distance = endPosition - startPosition;

    // Check if the drag distance is sufficient to count as a swipe
    if (Math.abs(distance) > swipeThreshold) {
      if (distance > 0) {
        prev(); // Swipe right
      } else {
        next(); // Swipe left
      }
    }
    
    setIsDragging(false);
    setStartPosition(null); // Reset after swipe/click
  };

  const handleWheel = (e) => {
    if (wheelTimeoutRef.current !== null) {
      // Debounce: If the wheel event triggers too soon after the previous one, ignore it
      return;
    }

    // Handle two-finger trackpad swipe via the wheel event
    if (Math.abs(e.deltaX) > swipeThreshold) {
      if (e.deltaX > 0) {
        next(); // Swipe left
      } else if (e.deltaX < 0) {
        prev(); // Swipe right
      }
    }

    // Set timeout to prevent rapid repeated swipes
    wheelTimeoutRef.current = setTimeout(() => {
      wheelTimeoutRef.current = null;
    }, 500); // Reduced debounce delay for more responsiveness (500ms)
  };

  const resetIdleTimer = () => {
    clearTimeout(fadeTimeoutRef.current);
    clearTimeout(idleTimeoutRef.current);

    setIsFading(false);
    setShowStats(true);
    setShowEvolutions(true);
    setShowDescription(true);

    idleTimeoutRef.current = setTimeout(() => {
      setIsFading(true);
      fadeTimeoutRef.current = setTimeout(() => {
        setShowStats(false);
        setShowEvolutions(false);
        setShowDescription(false);
      }, 1000); // Duration of the fade-out animation
    }, 15000); // 15 seconds of idle time
  };

  const loadShow = () => {
    if (itemRefs.current[active]) {
      let stt = 0;
      itemRefs.current[active].style.transform = 'translateX(0)';
      itemRefs.current[active].style.zIndex = 1;
      itemRefs.current[active].style.filter = 'none';
      itemRefs.current[active].style.opacity = 1;
      for (let i = active + 1; i < items.length; i++) {
        stt++;
        if (itemRefs.current[i]) {
          itemRefs.current[i].style.transform = `translateX(${200 * stt}px) scale(${1 - 0.2 * stt})`;
          itemRefs.current[i].style.zIndex = -stt;
          itemRefs.current[i].style.filter = 'blur(8px)';
          itemRefs.current[i].style.opacity = stt > 2 ? 0 : 0.6;
        }
      }
      stt = 0;
      for (let i = active - 1; i >= 0; i--) {
        stt++;
        if (itemRefs.current[i]) {
          itemRefs.current[i].style.transform = `translateX(${-200 * stt}px) scale(${1 - 0.2 * stt})`;
          itemRefs.current[i].style.zIndex = -stt;
          itemRefs.current[i].style.filter = 'blur(8px)';
          itemRefs.current[i].style.opacity = stt > 2 ? 0 : 0.6;
        }
      }
    }
  };

  const next = () => {
    if (active < items.length - 1) {
      setActive(active + 1);
    }
  };

  const prev = () => {
    if (active > 0) {
      setActive(active - 1);
    }
  };

  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current !== null) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="slider"
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onWheel={handleWheel}
    >
      <div className="items">
        {items.map((item, index) => {
          const isActive = index === active;
          const backgroundColor = typeColorsLight[item.types[0].type.name];
					const borderColor = typeColorsHalf[item.types[0].type.name];
					const japaneseNameEntry = jaPokemonNames.find(pokemon => pokemon.id === item.id);
          const japaneseName = japaneseNameEntry ? japaneseNameEntry.name : '';
          const normalizedName = normalizePokemonName(item.name);
          return (
            <div
              key={index}
              className={`item ${index === active ? 'active' : ''}`}
              ref={(el) => (itemRefs.current[index] = el)}
              style={{
                backgroundColor,
                borderColor,
                visibility: item.isImageLoaded ? 'visible' : 'hidden', // Hide the card until the image is loaded
              }}
            >
              <div className="top-info">
                <p id="number"><span>#</span>{item.id.toString().padStart(3, '0')}</p>
                <p id="hp"><span>HP</span>{item.stats[0].base_stat}</p>
              </div>
              <div className="names">
                <h3 className="name">{normalizedName}</h3>
							  {japaneseName && (
                  <h4 className="jap-name">{japaneseName}</h4>
                )}
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
                <img className="pokeimg" src={item.spriteUrl} alt={item.name}
                  style={{
                    animation: isActive ? 'pokemonAnimation 2.5s infinite linear' : null,
                    visibility: item.isImageLoaded ? 'visible' : 'hidden', // Hide the image if not loaded
                  }}
                />
            	</div>
              <div className={`pokeinfo fade ${isFading ? 'fade-out' : 'fade-in'}`}>
                {isActive && showStats && (
                  <PokemonStats stats={item.stats} types={item.types} pokemonName={item.name} />
                )}
                {isActive && showDescription && (
                  <PokemonDescription pokemonId={item.id} types={item.types} />
                )}
              </div>
              <div className={`fade ${isFading ? 'fade-out' : 'fade-in'}`}>
                {isActive && showEvolutions && (
                  <EvolutionPath pokemonId={item.id} onPokemonClick={onPokemonClick} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className='buttons'>
        <button id="prev" onClick={prev} style={{ visibility: active > 0 ? 'visible' : 'hidden' }}>-</button>
        <button id="next" onClick={next} style={{ visibility: active < items.length - 1 ? 'visible' : 'hidden' }}>+</button>
      </div>
    </div>
  );
};

export default AnimatedSlider;