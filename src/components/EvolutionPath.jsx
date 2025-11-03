import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EvolutionPath.css';
import { normalizePokemonName } from '../utils/normalizePokemonName';

const getPokemonImageUrl = (id) => {
  if (id <= 649) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  } else {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
};

const EvolutionPath = ({ pokemonId, onPokemonClick }) => {
  const [evolutionPaths, setEvolutionPaths] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [pokemonName, setPokemonName] = useState('');

  useEffect(() => {
    const fetchEvolutionData = async () => {
      try {
        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const pokemonName = speciesResponse.data.name;
        setPokemonName(normalizePokemonName(pokemonName));

        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
        const evolutionResponse = await axios.get(evolutionChainUrl);
        const evolutionPathsData = [];

        const getPokemonData = async (id) => {
          const pokemonData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const pokemonImg = getPokemonImageUrl(id);
          return { id: parseInt(id), name: normalizePokemonName(pokemonData.data.name), img: pokemonImg };
        };

        const parseEvolution = async (evolutionData, path = []) => {
          const pokemonId = parseInt(evolutionData.species.url.split('/').slice(-2, -1)[0], 10);
          const pokemonData = await getPokemonData(pokemonId);
          const newPath = [...path, pokemonData];
          
          if (evolutionData.evolves_to.length > 0) {
            for (const evolution of evolutionData.evolves_to) {
              await parseEvolution(evolution, newPath);
            }
          } else {
            evolutionPathsData.push(newPath);
          }
        };

        await parseEvolution(evolutionResponse.data.chain);

        setEvolutionPaths(evolutionPathsData);
      } catch (error) {
        console.error('Error fetching evolution data:', error);
      }
    };

    fetchEvolutionData();
  }, [pokemonId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoaded(true);
    }, 300); // Short delay to trigger the animation
    return () => clearTimeout(timeout);
  }, []);

  // Check if all evolution paths contain only one Pokemon
  const allPathsSingle = evolutionPaths.every(path => path.length === 1);

  return (
    <div className={`evolution-path ${loaded ? 'loaded' : ''}`}>
      <h3>Evolution Path</h3>
      <div className="evolution-images">
        {allPathsSingle ? (
          <p>{pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)} does not evolve.</p>
        ) : (
          evolutionPaths.map((evolutions, pathIndex) => (
            <div key={pathIndex} className="evolution-path-group">
              {evolutions.map((evolution, index) => (
                <React.Fragment key={evolution.id}>
                  <div className='evolution-item'>
                    <img
                      src={evolution.img}
                      alt={evolution.name}
                      className="evolution-image"
                      onClick={() => {
                        // console.log(`Clicked evolution ID: ${evolution.id}`);
                        onPokemonClick(evolution.id);
                      }}
                    />
                    <p><span>#</span>{evolution.id.toString().padStart(3, '0')}</p>
                    <p>{evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1)}</p>
                  </div>
                  {index < evolutions.length - 1 && <div className="arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </div>}
                </React.Fragment>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EvolutionPath;
