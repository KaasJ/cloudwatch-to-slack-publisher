const path = require('path')
const nodeBuiltins = require('builtin-modules')

const externals = ['aws-sdk']
  .concat(nodeBuiltins)
  .reduce((externalsMap, moduleName) => {
    externalsMap[moduleName] = moduleName
    return externalsMap
  }, {})

const fns = [
  'cloudwatch-slack-publisher'
]

const entry = {}
fns.forEach((name) => {
  const [file, entryName] = name.endsWith('.ts')
    ? [name, name.slice(0, -3)]
    : [`${name}/index.ts`, name]
  entry[entryName] = path.resolve(__dirname, `src/${file}`)
})

module.exports = {
  entry,
  externals,

  output: {
    filename: '[name]/index.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules', path.resolve(__dirname)],
    // We need .js as well for the node_modules to resolve properly
    extensions: ['.js', '.tsx', '.ts'],
  },
  target: 'async-node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  /*
  Compiling typescript in watch mode was causing heavy load on the CPU
  This forces watch to use a polling strategy at a 2s interval which fixed it
  */
  watchOptions: {
    poll: 2000,
  }
}
