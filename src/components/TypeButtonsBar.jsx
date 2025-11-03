import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TypeButtonsBar.css';
import { typeColorsHalf } from '../utils/typeColors';

const TypeButtonsBar = ({ onFilterType }) => {
  const [types, setTypes] = useState([]);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/type');
        const fetchedTypes = response.data.results.map(type => type.name);
        // Combine 'all' with fetched types
        setTypes(['all', ...fetchedTypes.sort()]);
      } catch (error) {
        console.error('Error fetching Pokémon types:', error);
      }
    };

    fetchTypes();
  }, []);

  // Trigger the fade-in animation after types are loaded
  useEffect(() => {
    if (types.length === 0) return;
    const timer = setTimeout(() => setShowBar(true), 300);
    return () => clearTimeout(timer);
  }, [types]);

  if (types.length === 0) return null; // Don't render until all types are loaded

  return (
    <div className={`type-buttons-bar ${showBar ? 'show' : ''}`}>
      {types.map((type) => (
        <button
          key={type}
          className="type-button"
          style={{
            backgroundColor: type === 'all' ? '#aaaaaa' : typeColorsHalf[type],
          }}
          onClick={() => onFilterType(type === 'all' ? '' : type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default TypeButtonsBar;