import React from 'react';
import './LoadingSpinner.css';
import pokeball from '../assets/pokeball.png';

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <img src={pokeball} alt="Loading..." className="spinner" />
    </div>
  );
};

export default LoadingSpinner;
