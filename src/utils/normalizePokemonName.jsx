export const normalizePokemonName = (name) => {
    if (!name) return '';

    // Convert name to lowercase
    const normalized = name.toLowerCase();

    // Handle specific cases for names with special characters or exceptions
    const nameReplacements = {
			'nidoran-m': 'Nidoran♂', // #032
			'nidoran-f': 'Nidoran♀', // #029
			'farfetchd': "Farfetch'd", // #083
			'mr-mime': 'Mr. Mime', // #122
			'mime-jr': 'Mime Jr.', // #439
			'ho-oh': 'Ho-Oh', // #250
			'sirfetchd': "Sirfetch'd", // #865
			'type-null': 'Type: Null', // #773
			'jangmo-o': 'Jangmo-o', // #782
			'hakamo-o': 'Hakamo-o', // #783
			'kommo-o': 'Kommo-o', // #784
			'porygon-z': 'Porygon-Z', // #474
			'flabebe': 'Flabébé', // #669
			'tapu-koko': 'Tapu Koko', // #785
			'tapu-lele': 'Tapu Lele', // #786
			'tapu-bulu': 'Tapu Bulu', // #787
			'tapu-fini': 'Tapu Fini', // #788
			'walking-wake': 'Walking Wake', // #1000
			'great-tusk': 'Great Tusk', // #1001
			'scream-tail': 'Scream Tail', // #1002
			'brute-bonnet': 'Brute Bonnet', // #1003
			'flutter-mane': 'Flutter Mane', // #1004
			'roaring-moon': 'Roaring Moon', // #1005
			'iron-treads': 'Iron Treads', // #1006
			'iron-bundle': 'Iron Bundle', // #1007
			'iron-hands': 'Iron Hands', // #1008
			'iron-valiant': 'Iron Valiant', // #1009
			'iron-thorns': 'Iron Thorns', // #1010
			'iron-jugulis': 'Iron Jugulis', // #1011
			'iron-leaves': 'Iron Leaves', // #1012
			'iron-moth': 'Iron Moth', // #1013
			'iron-boulder': 'Iron Boulder', // #1014
			'iron-crown': 'Iron Crown', // #1015
			'wo-chien': 'Wo-Chien', // #1000
			'chi-yu': 'Chi-Yu', // #1001
			'ting-lu': 'Ting-Lu', // #1002
			'chien-pao': 'Chien-Pao', // #1003
			'goughing-fire': 'Goughing Fire', // #1004
			'raging-bolt': 'Raging Bolt', // #1005
			'slither-wing': 'Slither Wing', // #1006
			'sandy-shocks': 'Sandy Shocks', // #1007
    };

    // Check if the normalized name is in the replacements list
    if (nameReplacements[normalized]) {
        return nameReplacements[normalized];
    }

    // If not, split by hyphen and capitalize the first letter of the first word
    const simplifiedName = name.split('-')[0].toLowerCase();
    return simplifiedName.charAt(0).toUpperCase() + simplifiedName.slice(1);
};
