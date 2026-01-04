import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AnimatedSlider from './AnimatedSlider';
import LoadingSpinner from './LoadingSpinner';
import jaPokemonNames from '../utils/jaPokemonNames.json';
import GenerationBar from './GenerationBar';
import { normalizePokemonName } from '../utils/normalizePokemonName';
import './Carousel.css';

const getPokemonImageUrls = (id) => ({
  dreamWorld: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`,
  official: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
});


export const Carousel = ({ searchTerm, filterType, filterById, onFilterType, onPokemonClick, isLoading, isDropdownActive, onPokemonData }) => {
  const [poke, setPoke] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [totalPokemonCount, setTotalPokemonCount] = useState(0);
  const [filteredPokemonCount, setFilteredPokemonCount] = useState(0);
  const [activePokemonIndex, setActivePokemonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true); // Start global loading
      const promises = [];
      for (let i = 1; i <= 1025; i++) {
        promises.push(
          axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`).then((res) => {
            setFetchedCount((prev) => prev + 1);
            return res;
          })
        );
      }
  
      const results = await Promise.all(promises);
      
      const pokemonData = results.map(result => {
        const japaneseNameEntry = jaPokemonNames.find(pokemon => pokemon.id === result.data.id);
        const japaneseName = japaneseNameEntry ? japaneseNameEntry.name : ''; // Get Japanese name from JSON

        return {
          ...result.data,
          spriteUrls: getPokemonImageUrls(result.data.id),
          spriteUrl: null, // Will be set later based on availability
          normalizedName: normalizePokemonName(result.data.name), // Normalize the English name
          japaneseName, // Use the Japanese name from the JSON
          isImageLoaded: false, // Track whether the image has loaded
        };
      });
      
      setPoke(pokemonData); // Set Pokémon data in state
      setTotalPokemonCount(pokemonData.length); // Set total Pokémon count
      onPokemonData(pokemonData); // Pass Pokémon data to App
  
      // Preload images
      pokemonData.forEach((poke, index) => {
        const img = new Image();
        img.src = poke.spriteUrls.dreamWorld;

        img.onload = () => handleImageLoad(index, poke.spriteUrls.dreamWorld); // Handle image load event

        img.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.src = poke.spriteUrls.official;

          fallbackImg.onload = () => handleImageLoad(index, poke.spriteUrls.official); // Handle image error with fallback image

          fallbackImg.onerror = () => handleImageLoad(index, null); // If both images fail, mark as loaded with null
        }
      });
    };
  
    fetchPokemon();
  }, []);
  
  const handleImageLoad = (index, url) => {
    setLoadedImages(prev => prev + 1);

    setPoke(prevPoke => {
      const newPoke = [...prevPoke];
      newPoke[index] = {
        ...newPoke[index],
        spriteUrl: url,
        isImageLoaded: true,
      }
  
      // Check if all images are loaded using the updated array
      const allLoaded = newPoke.every(p => p.isImageLoaded);
  
      if (allLoaded) setLoading(false);
  
      return newPoke;
    });
  };

  const total = 1025 * 2; // 1025 fetches + 1025 images
  const progress = Math.round(
    Math.min(((fetchedCount + loadedImages) / total) * 100, 100)
  );

  // Use useMemo to memoize the data
  const memoizedPoke = useMemo(() => poke, [poke]);

  useEffect(() => {
    let filtered = memoizedPoke;

    if (searchTerm) {
      // Check if the search term is a number
      const isNumber = !isNaN(searchTerm);

      if (isNumber) {
        // Filter by Pokémon ID
        filtered = filtered.filter(p => p.id === parseInt(searchTerm, 10));
      } else {
        // Filter by Pokémon name (English or Japanese)
        filtered = filtered.filter(p =>
          p.normalizedName.toLowerCase().includes(searchTerm.toLowerCase()) || // Filter by normalized English name
          p.japaneseName.toLowerCase().includes(searchTerm.toLowerCase()) // Include Japanese name in search
        );
      }
    }

    if (filterType) {
      // Filter by Pokémon type
      filtered = filtered.filter(p => p.types.some(t => t.type.name === filterType));
    }

    if (filterById) {
      // Filter by Pokémon ID on Pokémon click (In Evolution Path)
      filtered = filtered.filter(p => p.id === filterById);
      // console.log(`Filtering by ID: ${filterById}`);
      // console.log(filtered);
    }
    
    setFilteredPokemon(filtered);
    setFilteredPokemonCount(filtered.length); // Set filtered Pokemon count
  }, [searchTerm, filterType, filterById, memoizedPoke]);

  const handleSelectGeneration = (startId) => {
    const index = poke.findIndex(p => p.id === startId);
    if (index !== -1) {
      setActivePokemonIndex(index);
    }
  };

  return (
    <div className={`carousel-container ${isDropdownActive ? 'blurred' : ''}`}>
      <div className="pokemon-count">
        {searchTerm || filterType || filterById ? (
          <p>{filteredPokemonCount > 0 ? `${activePokemonIndex + 1}/${filteredPokemonCount}` : `0/${filteredPokemonCount}`} Pokémon found out of {totalPokemonCount}</p>
        ) : (
          <p>Total Pokémon: {totalPokemonCount}</p>
        )}
      </div>
      <GenerationBar
        onSelectGeneration={handleSelectGeneration}
        disabled={!!searchTerm || !!filterType || !!filterById} />
      {loading || isLoading ? (
        <div className="loading-wrapper">
          <LoadingSpinner />

          <div className="loading-bar-container">
            <div className="loading-bar" style={{ width: `${progress}%` }}></div>
          </div>

          <p className="loading-text">{progress}%</p>
        </div>
      ) : (
        <AnimatedSlider
          items={filteredPokemon}
          onFilterType={onFilterType}
          onActiveChange={(index) => setActivePokemonIndex(index)}
          onPokemonClick={onPokemonClick}
          active={activePokemonIndex}
        />
      )}
    </div>
  );
};
