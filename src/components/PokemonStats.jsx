import React, { useEffect, useState, useRef } from 'react';
import './PokemonStats.css';
import { typeColorsHalf } from '../utils/typeColors';
import { normalizePokemonName } from '../utils/normalizePokemonName';

const PokemonStats = ({ stats, types, pokemonName }) => {
  const maxStatValue = 255;
  const maxStat = Math.max(...stats.map(stat => stat.base_stat));
  const [loaded, setLoaded] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = statsRef.current.getBoundingClientRect();
      const x = clientX - left - width / 2;
      const y = clientY - top - height / 2;

      const rotateX = (-y / height) * 20;
      const rotateY = (x / width) * 20;

      statsRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const statsElement = statsRef.current;
    statsElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      statsElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoaded(true);
    }, 100); // Short delay to trigger the animation
    return () => clearTimeout(timeout);
  }, []);

  const backgroundColor = typeColorsHalf[types[0].type.name];
  const borderColor = typeColorsHalf[types[0].type.name];

  return (
    <div
      className={`pokemon-stats ${loaded ? 'loaded' : ''}`}
      ref={statsRef}
      style={{ borderColor }}>
      <h3>{normalizePokemonName(pokemonName)}'s Stats</h3>
      <ul>
        {stats.map((stat) => (
          <li key={stat.stat.name}>
            <span className="stat-name">{stat.stat.name}</span>
            <div className="stat-bar-container">
              <div
                className="stat-bar"
                style={{
                  width: loaded ? `${(stat.base_stat / maxStatValue) * 100}%` : '0%',
                  backgroundColor
                }}
              />
            </div>
            <span
              className="stat-value"
              style={{
                fontWeight: stat.base_stat === maxStat ? 'bold' : 'normal',
                color: stat.base_stat === maxStat ? backgroundColor : 'inherit'
              }}
            >
              {stat.base_stat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PokemonStats;
