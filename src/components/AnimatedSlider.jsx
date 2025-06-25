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
  const swipeThreshold = 6; // Minimum distance for a swipe to be registered
  const wheelTimeoutRef = useRef(null); // For debouncing the wheel event

  const [showStats, setShowStats] = useState(false);
  const [showEvolutions, setShowEvolutions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const itemRefs = useRef([]);
  

  useEffect(() => {
    setActive(propActive);
  }, [propActive]);

  useEffect(() => {
    loadShow();
    onActiveChange(active); // Notify parent about the active index change
    
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
    setActive(0); // Reset active state to 0 whenever items change
  }, [items]);

  useEffect(() => {
    loadShow();
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);


  // Touch and mouse event handlers for swiping to next and prev card
  const handleStart = (e) => {
    e.preventDefault(); // Prevent text selection
    const posX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    const posY = e.type === 'mousedown' ? e.pageY : e.touches[0].pageY; // Track vertical position
    setStartPosition({ x: posX, y: posY });
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging || startPosition.x === null || startPosition.y === null) return;
    
    const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
    const currentY = e.type === 'mousemove' ? e.pageY : e.touches[0].pageY;
    const diffX = currentX - startPosition.x;
    const diffY = currentY - startPosition.y;

    // Check if the movement is more horizontal than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      // Horizontal swipe detected, prevent vertical scroll
      e.preventDefault(); 
    }
  };

  const handleEnd = (e) => {
    if (!isDragging || startPosition.x === null) return;

    const endPositionX = e.type === 'mouseup' ? e.pageX : e.changedTouches[0].pageX;
    const endPositionY = e.type === 'mouseup' ? e.pageY : e.changedTouches[0].pageY;
    const diffX = endPositionX - startPosition.x;
    const diffY = endPositionY - startPosition.y;

    // Only handle the swipe if it is more horizontal than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      e.preventDefault(); // Prevent default action (like scrolling)
      if (diffX > 0) {
        prev(); // Swipe right
      } else {
        next(); // Swipe left
      }
    }

    setIsDragging(false);
    setStartPosition({ x: null, y: null }); // Reset after swipe
  };

  const handleWheel = (e) => {
    if (wheelTimeoutRef.current !== null) {
      // Debounce: If the wheel event triggers too soon after the previous one, ignore it
      return;
    }

    // Handle two-finger trackpad swipe via the wheel event
    if (Math.abs(e.deltaX) > swipeThreshold) {
      e.preventDefault(); // Prevent default scrolling behavior
      if (e.deltaX > 0) {
        next(); // Swipe left
      } else if (e.deltaX < 0) {
        prev(); // Swipe right
      }
    }

    // Set timeout to prevent rapid repeated swipes
    wheelTimeoutRef.current = setTimeout(() => {
      wheelTimeoutRef.current = null;
    }, 400); // Reduced debounce delay for more responsiveness (400ms)
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
    <div className="slider">
      <div className="items"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onWheel={handleWheel}
      >
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
              <div className="pokeinfo fade">
                {isActive && showStats && (
                  <PokemonStats stats={item.stats} types={item.types} pokemonName={item.name} />
                )}
                {isActive && showDescription && (
                  <PokemonDescription pokemonId={item.id} types={item.types} />
                )}
              </div>
              <div className="fade">
                {isActive && showEvolutions && (
                  <EvolutionPath pokemonId={item.id} onPokemonClick={onPokemonClick} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="buttons">
        <button id="prev" className="ArrowLeft" onClick={prev} style={{ visibility: active > 0 ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
          </svg>
        </button>
        <button id="next" className="ArrowRight" onClick={next} style={{ visibility: active < items.length - 1 ? 'visible' : 'hidden' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AnimatedSlider;