import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import logo from '../assets/logo.png';
import pokemonlogo from '../assets/pokemon-text-logo.png';
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
  const [showHeader, setShowHeader] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHeader(true); // Trigger the animation
    }, 300); // Delay before showing the bar

    return () => clearTimeout(timer);
  }, []);

  return (
      <div className={`header ${showHeader ? 'show' : ''}`}>
        <div className="logo-box">
          <img src={logo} alt="Logo" className="logo" onClick={handleLogoClick} />
        </div>
        <div className="search-container" ref={dropdownContainerRef}>
          <input
            id="search"
            type="text"
            className="search-bar"
            placeholder='Search in English, Japanese or by #. . .'
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
            I'm Feeling Lucky
          </button>
        </div>
        <div className="text-logo-box">
          <img src={pokemonlogo} alt="pokemon-text-logo" className="pokemon-logo"/>
        </div>
      </div>
  );
};

export default Header;
