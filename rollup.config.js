import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { obfuscator } from 'rollup-obfuscator'
import copy from 'rollup-plugin-copy'
import html from 'rollup-plugin-html'

const { PRODUCTION } = process.env
const BASE_URL = PRODUCTION
  ? 'https://crowd-control-mods.s3.amazonaws.com/VampireSurvivors'
  : 'http://localhost:8080/VampireSurvivors'
const OUTPUT_FILENAME = 'crowd-control-bootstrap.js'

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: {
    file: `dist/VampireSurvivors/${OUTPUT_FILENAME}`,
    format: 'cjs',
  },
  plugins: [
    html(),
    copy({
      targets: [
        {
          src: 'patches/*',
          dest: 'dist/VampireSurvivors',
        },
        {
          src: 'src/index.html',
          dest: 'dist',
          transform: (contents) =>
            contents
              .toString()
              .replace('{{CROWD_CONTROL_SCRIPT}}', '')
              .replace('{{BOOTSTRAP_FILE}}', `${BASE_URL}/${OUTPUT_FILENAME}`),
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
