module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'rules': {
    'camelcase': 0,
    'linebreak-style': 0,
    'new-cap': 0,
    'max-len': 0,
    'no-invalid-this': 0,
    'no-var': 0,
  },
};
