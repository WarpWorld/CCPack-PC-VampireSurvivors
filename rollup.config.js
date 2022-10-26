import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { obfuscator } from 'rollup-obfuscator'
import copy from 'rollup-plugin-copy'

const { PRODUCTION } = process.env
const BASE_URL = PRODUCTION ? 'https://crowd-control-mods.s3.amazonaws.com/VampireSurvivors' : 'http://localhost:8080'
const OUTPUT_FILENAME = 'crowd-control-bootstrap.js'

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: {
    file: `dist/${OUTPUT_FILENAME}`,
    format: 'cjs',
  },
  plugins: [
    copy({
      targets: [
        {
          src: 'patches/*',
          dest: 'dist/',
          transform: (contents) => {
            if (!PRODUCTION) return contents
            const patches = JSON.parse(contents.toString()).filter(({ debug }) => !debug)
            return JSON.stringify(patches)
          },
        },
        {
          src: 'index.html',
          dest: 'dist',
          transform: (contents) => contents.toString().replace('{{BOOTSTRAP_FILE}}', `${BASE_URL}/${OUTPUT_FILENAME}`),
        },
      ],
    }),
    json(),
    typescript(),
    PRODUCTION
      ? obfuscator({
          compact: true,
        })
      : null,
  ],
  external: ['fs', 'path'],
}

export default config
