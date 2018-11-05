import cjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import node from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

const plugins = [
  babel(),
  cjs({
    sourceMap: true
  }),
  node()
]

const useMinify = !!process.env.MINIFY

if (useMinify) {
  plugins.push(uglify({}, minify))
}

export default {
  input: './src/index.js',
  output: {
    file: useMinify ? './dist/stateshot.min.js' : './dist/stateshot.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins
}
