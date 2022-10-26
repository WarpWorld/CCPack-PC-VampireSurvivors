import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
const { origin, pathname } = new URL(import.meta.url)
export const { version } = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json')).toString())

type Patch = {
  debug?: boolean
  search: { prefix: string; suffix: string }
  inject: string
}

const IS_DEBUG = origin.includes('localhost')
const SOURCE_FILE = 'main.bundle.js'

const loadOriginalGame = () => {
  const scriptEl = document.createElement('script')
  scriptEl.src = SOURCE_FILE
  scriptEl.setAttribute('defer', 'true')
  document.head.appendChild(scriptEl)
}

const writeGame = (code: string) => {
  const scriptEl = document.createElement('script')
  // scriptEl.src = `${origin}/main.crowd-control.1_0_111.bundle.js`
  scriptEl.text = `(() => {${code}})()`
  scriptEl.setAttribute('defer', 'true')

  document.body.appendChild(scriptEl)
}

export const bootstrap = async () => {
  const dirName = dirname(pathname)
  const patchURL = `${origin}${dirName}/${version.replace(/\./g, '_')}.json`
  const response = await fetch(patchURL)

  if (!response.ok) {
    loadOriginalGame()
    return { success: false, message: `Failed to load patch for v${version}` }
  }

  try {
    const patches = (await response.json()) as Patch[]
    let patched = readFileSync(resolve(__dirname, SOURCE_FILE)).toString()
    patches.forEach((patch) => {
      const {
        debug,
        search: { prefix, suffix },
        inject,
      } = patch

      if (!IS_DEBUG && debug) return
      patched = patched.replace(`${prefix}${suffix}`, `${prefix}${inject}${suffix}`)
    })

    requestAnimationFrame(() => writeGame(patched))
    return { success: true }
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Unknown Error' }
  }
}
