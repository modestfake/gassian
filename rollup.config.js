import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import resolve from '@rollup/plugin-node-resolve'
import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'gassian',
      file: pkg.browser,
      format: 'umd',
    },
    external: ['md5', 'cross-fetch/polyfill'],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'external',
      }),
      filesize(),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    external: ['md5', 'cross-fetch/polyfill'],
    plugins: [resolve(), commonjs(), filesize()],
  },
]
