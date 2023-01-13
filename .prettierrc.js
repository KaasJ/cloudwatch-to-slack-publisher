module.exports = {
  // end lines with semicolons;
  semi: false,
  /*
  controls the insertion of trailing commas.
  const foo = {             const foo = { 
    bar: baz        ==>       bar: baz,
  }                         }
  es5 setting inserts them where valid.
  this makes copy pasting easier.
  */
  trailingComma: 'es5',
  // ''
  singleQuote: true,
  /*
  For readability prettier recommends against using more than 80 characters:
  It actually tries to maximize the linespace so if we set this
  to 100 / 120 it is likely to become overly compact.
  */
  printWidth: 80,
  // indentation
  tabWidth: 2,
  arrowParens: 'always',
}
