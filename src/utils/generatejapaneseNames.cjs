const fs = require('fs');
const pokemon = require('pokemon');

// Get an array of all Pokémon names in Japanese
const japaneseNames = [];

for (let i = 1; i <= 1025; i++) { // Adjust the range for the total number of Pokémon
  const name = pokemon.getName(i, 'ja');
  japaneseNames.push({ id: i, name });
}

// Write the data to a JSON file
fs.writeFileSync('jaPokemonNames.json', JSON.stringify(japaneseNames, null, 2));

console.log('Japanese Pokémon names have been written to jaPokemonNames.json');
