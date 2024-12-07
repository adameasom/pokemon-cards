import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import logo from '../assets/logo.png';
import pokeball from '../assets/pokeball.png';
import { normalizePokemonName } from '../utils/normalizePokemonName';

const getPokemonImageUrl = (id) => {
  if (id <= 649) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  } else {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
};

const Header = ({ onSearch, onResetSearch, onLogoClick, clearSearchInput, setClearSearchInput, onFeelingLucky, setIsDropdownActive, allPokemon }) => {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const dropdownContainerRef = useRef(null);

  const handleChange = (event) => {
    const searchTerm = event.target.value;
    setSearchInput(searchTerm);

    if (searchTerm.length > 0) {
      const filteredSuggestions = allPokemon.filter(p => 
        normalizePokemonName(p.name).toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.japaneseName.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 30); // Limit suggestions to 30
      setSuggestions(filteredSuggestions);
      setIsDropdownActive(true); // Activate blur on the carousel
    } else {
      setSuggestions([]); // Clear suggestions if input is too short
      setIsDropdownActive(false); // Hide blur if no suggestions
    }
  };

  const getHighlightedText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? <span key={index} className="highlight-marker">{part}</span> : part
    );
  };  
  
  const handleSearch = () => {
    if (searchInput.trim()) {
      onSearch(searchInput.toLowerCase());
      setSuggestions([]); // Clear suggestions when search is triggered
      setIsDropdownActive(false); // Close dropdown and blur on search
    }
  };

  const handleSuggestionClick = (pokemon) => {
    const normalizedName = normalizePokemonName(pokemon.name)
    setSearchInput(normalizedName);
    onSearch(normalizedName);
    setSuggestions([]); // Clear suggestions when a suggestion is clicked
    setIsDropdownActive(false); // Close dropdown and blur on selection
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && searchInput.trim()) {
      handleSearch(); // Trigger search when "Enter" is pressed
    }
  };

  const handleLogoClick = () => {
    setSearchInput('');
    onResetSearch();
    onLogoClick(); 
    setSuggestions('');
  };

  const handleFeelingLucky = () => {
    onFeelingLucky();
    setSearchInput('');
    setSuggestions('');
  };

  useEffect(() => {
    if (clearSearchInput) {
      setSearchInput('');
      setClearSearchInput(false); // Reset state for future use
    }
  }, [clearSearchInput, setClearSearchInput]);

  // Close dropdown when clicking outside of the input or dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setSuggestions([]); // Clear suggestions if clicked outside the container
        setIsDropdownActive(false); // Remove blur when clicking outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownContainerRef]);

  return (
      <div className="header">
        <div className="logo-box">
          <img src={logo} alt="Logo" className="logo" onClick={handleLogoClick} />
        </div>
        <div className="search-container" ref={dropdownContainerRef}>
          <input
            id="search"
            type="text"
            className="search-bar"
            placeholder="search pokémon..."
            value={searchInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <button className="search-button" onClick={handleSearch}>
            <img src={pokeball} alt="pokeball-button" className="poke-button" />
          </button>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((pokemon) => (
                <li key={pokemon.id} onClick={() => handleSuggestionClick(pokemon)}>
                  <img src={getPokemonImageUrl(pokemon.id)} alt={normalizePokemonName(pokemon.name)} className="suggestion-image" />
                  <span><span className='hash'>#</span>{pokemon.id.toString().padStart(3, '0')} {getHighlightedText(normalizePokemonName(pokemon.name), searchInput)} | {getHighlightedText(pokemon.japaneseName, searchInput)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="feeling-lucky-container">
          <button className="feeling-lucky-button" onClick={handleFeelingLucky}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <span>I'm Feeling Lucky</span>
          </button>
        </div>
      </div>
  );
};

export default Header;
