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
        setTypes(fetchedTypes.sort());
      } catch (error) {
        console.error('Error fetching Pokémon types:', error);
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBar(true); // Trigger the animation
    }, 300); // Delay before showing the bar

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`type-buttons-bar ${showBar ? 'show' : ''}`}>
      <button
        key="all"
        className="type-button"
        style={{ backgroundColor: '#aaaaaa' }}
        onClick={() => onFilterType('')}
      >
        All
      </button>
      {types.map((type) => (
        <button
          key={type}
          className="type-button"
          style={{ backgroundColor: typeColorsHalf[type] }}
          onClick={() => onFilterType(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default TypeButtonsBar;
