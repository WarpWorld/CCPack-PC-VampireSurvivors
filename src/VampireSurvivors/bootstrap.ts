import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { log } from '../CrowdControl'
const { origin, pathname } = new URL(import.meta.url)
export const { version } = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json')).toString())

declare global {
  interface Window {
    VS_DEBUG?: boolean
  }
}

type Patch = {
  debug?: boolean
  search: { prefix: string; suffix: string }
  inject: string
}

const IS_DEBUG = origin.includes('localhost') || window.VS_DEBUG
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

  log('Writing Patched Script Tag', scriptEl)
  document.body.appendChild(scriptEl)
}

export const bootstrap = async () => {
  try {
    const now = Date.now()
    const dirName = dirname(pathname)
    const patchURL = `${origin}${dirName}/${version.replace(/\./g, '_')}.json?time=${now}`
    const response = await fetch(patchURL, {
      cache: 'no-store',
    })

    if (!response.ok) {
      loadOriginalGame()
      return { success: false, message: `Failed to load patch for v${version}` }
    }

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

    log('Preparing to write Patched Script Tag')
    requestAnimationFrame(() => writeGame(patched))

    setTimeout(() => {
      log('Bootstrap: checking for canvas')
      const el = document.querySelector('#phaser-game canvas')

      if (el) return
      window.location.reload()
    }, 2500)
    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error'
    alert(`Error Patching file: ${message}`)
    return { success: false, message }
  }
}
