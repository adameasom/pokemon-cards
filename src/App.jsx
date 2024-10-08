import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import TypeButtonsBar from './components/TypeButtonsBar';
import { Carousel } from "./components/Carousel";
import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterById, setFilterById] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [clearSearchInput, setClearSearchInput] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [allPokemon, setAllPokemon] = useState([]); // Store all Pokémon

  const handlePokemonData = (pokemonData) => {
    setAllPokemon(pokemonData); // Update all Pokémon when fetched
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setFilterType(''); // Clear type filter when searching
    setFilterById(''); // Clear id when searching
  };

  const handleFilterType = (type) => {
    setFilterType(type);
    setSearchTerm(''); // Clear search term when filtering by type
    setFilterById(''); // Clear id when filtering by type
    setClearSearchInput(true); // Clear search input when searching by type
  };

  const handlePokemonClick = (id) => {
    setFilterById(id);
    setSearchTerm(''); // Clear search term when filtering by id
    setFilterType(''); // Clear type filter when filtering by id
    setClearSearchInput(true); // Clear search input when clicking a pokemon
  }

  const resetSearch = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterById('');
  };

  const handleLogoClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      resetSearch();
    }, 500); // Adjust the delay as needed
  };

  const handleFeelingLucky = () => {
    const randomId = Math.floor(Math.random() * 1000) + 1; // 649 Pokémon
    setFilterById(randomId);
    setSearchTerm(''); // Clear search term when filtering by randomid
    setFilterType(''); // Clear type filter when filtering by randomid
  };

  return (
    <div className="app-container">
      <Header
        onSearch={handleSearch}
        onResetSearch={resetSearch}
        onLogoClick={handleLogoClick}
        onFeelingLucky={handleFeelingLucky}
        clearSearchInput={clearSearchInput}
        setClearSearchInput={setClearSearchInput}
        setIsDropdownActive={setIsDropdownActive}
        allPokemon={allPokemon}
      />
      <TypeButtonsBar
        onFilterType={handleFilterType}
      />
      <Routes>
        <Route
          path="/"
          element={<Carousel
            searchTerm={searchTerm}
            filterType={filterType}
            filterById={filterById}
            onFilterType={handleFilterType}
            onPokemonClick={handlePokemonClick}
            onPokemonData={handlePokemonData}
            isDropdownActive={isDropdownActive}
            isLoading={isLoading} />} />
      </Routes>
    </div>
  );
};

export default App;