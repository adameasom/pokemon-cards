import React, { useState, useEffect } from 'react';
import './GenerationBar.css';

const GenerationBar = ({ onSelectGeneration, disabled }) => {
  const [showGenBar, setShowGenBar] = useState(false);

  const generations = [
    { label: 'Gen I', id: 1, start: 1, end: 151 },
    { label: 'Gen II', id: 2, start: 152, end: 251 },
    { label: 'Gen III', id: 3, start: 252, end: 386 },
    { label: 'Gen IV', id: 4, start: 387, end: 493 },
    { label: 'Gen V', id: 5, start: 494, end: 649 },
    { label: 'Gen VI', id: 6, start: 650, end: 721 },
    { label: 'Gen VII', id: 7, start: 722, end: 809 },
    { label: 'Gen VIII', id: 8, start: 810, end: 905 },
    { label: 'Gen IX', id: 9, start: 906, end: 1025 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGenBar(true); // Trigger the animation
    }, 300); // Delay before showing the bar

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`generation-bar ${showGenBar ? 'show' : ''}`}>
      {generations.map(gen => (
        <button
          key={gen.id}
          onClick={() => onSelectGeneration(gen.start)}
          disabled={disabled} // Disable the button if the prop is true
          className={disabled ? 'disabled' : ''}
        >
          {gen.label}
        </button>
      ))}
    </div>
  );
};

export default GenerationBar;
