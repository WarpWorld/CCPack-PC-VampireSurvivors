import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { log } from '../CrowdControl'
const { origin, pathname } = new URL(import.meta.url)
export const { version } = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json')).toString())
import RAW_HTML_TEMPLATE from '../index.html'

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

const IS_LOCAL = origin.includes('localhost')
const BASE_URL = IS_LOCAL
  ? 'http://localhost:8080/VampireSurvivors'
  : 'https://crowd-control-mods.s3.amazonaws.com/VampireSurvivors'
const OUTPUT_FILENAME = 'crowd-control-bootstrap.js'
const IS_DEBUG = IS_LOCAL || window.VS_DEBUG
const HTML_TEMPLATE = RAW_HTML_TEMPLATE.replace('{{BOOTSTRAP_FILE}}', `${BASE_URL}/${OUTPUT_FILENAME}`)
const SOURCE_FILE = 'main.bundle.js'

const saveScriptTag = (filename: string, version: string, patched: boolean) => {
  const html = HTML_TEMPLATE.replace(
    '{{CROWD_CONTROL_SCRIPT}}',
    `<script defer id="crowd-control-script" data-version="${version}"${
      patched ? ' data-patched="true"' : ''
    } src="${filename}"></script>`
  )

  writeFileSync(resolve(__dirname, 'index.html'), html)
}

const writeOriginalGame = () => {
  saveScriptTag(SOURCE_FILE, version, false)
  window.location.reload()
}
const writePatchedGame = (code: string, version: string) => {
  const patchedFileName = 'crowd-control.main.bundle.js'
  const srcUrl = resolve(__dirname, patchedFileName)
  writeFileSync(srcUrl, `console.log('[CrowdControl] Injected Game Code Running for ${version}');${code}`)
  saveScriptTag(patchedFileName, version, true)
  window.location.reload()
}

export const bootstrap = async () => {
  try {
    const scriptEl = document.querySelector<HTMLScriptElement>('#crowd-control-script')
    const now = Date.now()
    const dirName = dirname(pathname)
    const patchURL = `${origin}${dirName}/${version.replace(/\./g, '_')}.json?time=${now}`
    const response = await fetch(patchURL, {
      cache: 'no-store',
    })

    if (!response.ok) {
      log('Remote Patch file Not found for', version)
      if (scriptEl?.dataset.patched || scriptEl?.dataset.version !== version) {
        log('Script is not patched or a version mismatch, re-writing original game')
        scriptEl?.remove()
        writeOriginalGame()
      } else {
        log('Unpatched vanilla script already present, loading game.')
      }
      return { success: false, message: `Failed to load patch for v${version}` }
    }

    const { version: patchVersion, patches } = (await response.json()) as { version: string; patches: Patch[] }
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

    const fullVersion = `${version}-${patchVersion}`
    log(`Checking for Patched Script Tag for ${fullVersion} script is at version ${scriptEl?.dataset.version}`)
    if (!scriptEl?.dataset.patched || scriptEl?.dataset.version !== fullVersion) {
      scriptEl?.remove()
      log('Script tag not found, unpatched, or a version mismatch. Re-writing Patched Script Tag for', version)
      requestAnimationFrame(() => writePatchedGame(patched, fullVersion))
    } else {
      log(`Patched Script tag found for version ${fullVersion}. Starting Crowd Control VS`)
    }

    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error'
    alert(`Error Patching file: ${message}`)
    return { success: false, message }
  }
}
