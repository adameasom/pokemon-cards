import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PokemonDescription.css';
import { normalizePokemonName } from '../utils/normalizePokemonName';
import { typeColorsHalf } from '../utils/typeColors'

const PokemonDescription = ({ pokemonId, types }) => {
  const [descriptions, setDescriptions] = useState([]);
  const [pokemonName, setPokemonName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    const fetchPokemonDescription = async () => {
      try {
        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const flavorTextEntries = speciesResponse.data.flavor_text_entries;
        const englishDescriptions = flavorTextEntries.filter(entry => entry.language.name === 'en');
        
        // Fetch and normalize Pokémon name
        const name = speciesResponse.data.name;
        const normalizedName = normalizePokemonName(name);
        setPokemonName(normalizedName);

        // Handle no descriptions case or empty response
        if (!englishDescriptions || englishDescriptions.length === 0) {
          setDescriptions([{ flavor_text: "No description available" }]);
          return;
        }

        // Ensure we can safely select random descriptions
        const randomDescriptions = [];
        const descriptionLimit = Math.min(3, englishDescriptions.length);
        const usedIndexes = new Set();
        
        while (randomDescriptions.length < descriptionLimit) {
          const randomIndex = Math.floor(Math.random() * englishDescriptions.length);
          if (!usedIndexes.has(randomIndex)) {
            usedIndexes.add(randomIndex);
            randomDescriptions.push(englishDescriptions[randomIndex]);
          }
        }

        setDescriptions(randomDescriptions);
      } catch (error) {
        console.error('Error fetching Pokémon description:', error);
        setDescriptions([{ flavor_text: "No description available due to an error." }]);
      }
    };

    fetchPokemonDescription();
  }, [pokemonId]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = descRef.current.getBoundingClientRect();
      const x = clientX - left - width / 2;
      const y = clientY - top - height / 2;

      const rotateX = (-y / height) * 20;
      const rotateY = (x / width) * 20;

      descRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const descElement = descRef.current;
    descElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      descElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoaded(true);
    }, 1000); // Short delay to trigger the animation
    return () => clearTimeout(timeout);
  }, []);

  const borderColor = typeColorsHalf[types[0].type.name];
  
  return (
    <div
      className={`pokemon-description ${loaded ? 'loaded' : ''}`}
      ref={descRef}
      style={{ borderColor }}>
      <h3>{pokemonName}'s Bio</h3>
      <p>(Random & Dynamic)</p>
      <ul>
        {descriptions.map((desc, index) => (
          <li key={index}>{desc.flavor_text}</li>
        ))}
      </ul>
    </div>
  );
};

export default PokemonDescription;
