
const generateRandomInteger = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomDouble = (min, max) => {
  return Math.random() * (max - min) + min;
};

const generateRandomCharacters = (size) => {
  let characters = `abcdefghijklmnopqrstuvwxyz!@#$%^&*() `;

  let word = '';
  for (var i = 0; i < size; i++) {
    let randomNum = generateRandomInteger(0, characters.length - 1);
    word = `${word}${characters[randomNum]}`;
  }

  return word;
};

module.exports.bigint = () => {
  return generateRandomInteger(10000, 1000000);
};

module.exports.boolean = () => {
  let result = generateRandomInteger(0, 1);
  return result === 1 ? true : false;
};

module.exports.date = () => {
  // TODO: ooof
  return '2011-12-04';
};

module.exports.doublePrecision = () => {
  return generateRandomDouble(0, 5000);
}

module.exports.integer = () => {
  return generateRandomInteger(0, 1000);
}

module.exports.character = () => {
  return generateRandomCharacters(1);
}

module.exports.characterVarying = () => {
  let length = generateRandomInteger(5, 50);
  return generateRandomCharacters(length);
}