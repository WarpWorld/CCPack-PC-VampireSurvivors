import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { resolve } from 'path'
import mkdirp from 'mkdirp'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const version = '1.2.114'

const general = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', `general.json`)))
const enemyNames = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', `enemy-names.json`)))
const musicLibrary = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', `music-library.json`)))
const spawnableItems = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', `spawnable.json`)))
const weapons = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', `v${version}_WEAPON_DATA.json`)))
const items = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', `v${version}_ITEM_DATA.json`)))
const enemies = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', `v${version}_ENEMY_DATA.json`)))

const header = `using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using ConnectorLib.SimpleTCP;
using CrowdControl.Common;

namespace CrowdControl.Games.Packs
{
    [SuppressMessage("ReSharper", "CommentTypo")]
    [SuppressMessage("ReSharper", "StringLiteralTypo")]
    public class VampireSurvivors : SimpleTCPPack<SimpleWebsocketServerConnector>
    {
        public override string Host => "0.0.0.0";

        public override ushort Port => 43384;
        
        // Built with version ${version}
        public VampireSurvivors(IPlayer player, Func<CrowdControlBlock, bool> responseHandler, Action<object> statusUpdateHandler) : base(player, responseHandler, statusUpdateHandler) { }

        public override Game Game { get; } = new(174, "Vampire Survivors", "VampireSurvivors", "PC", ConnectorType.SimpleWebsocketServerConnector);

        public override List<Effect> Effects => new()
        {`

const footer = `
        };
    }
}`

const meta = ({ duration, description }) => {
  const meta = []
  if (duration) meta.push(`Duration = TimeSpan.FromSeconds(${duration})`)
  if (description) meta.push(`Description = "${description}"`)

  return meta.length ? ` { ${meta.join(', ')} }` : ''
}

const effectsMap = new Map()
const createEffect = ({ name, key, ...rest }, { prefix, folder, allowDurational, overlayPrefix } = {}) => {
  if (!allowDurational) delete rest.duration
  key = `${prefix ? `${prefix}_` : ''}${key.toLowerCase()}`

  effectsMap.set(key, { name, overlayPrefix })
  return `${indent}new("${name}", "${key}"${folder ? `, "${folder}"` : ''})${meta(rest)}`
}

const indent = ' '.repeat(12)
const getNameFromKey = (key) =>
  key
    .replace(/BOSS_/g, '')
    .replace(/_/g, ' ')
    .replace(/^(XL)(.+)/g, '$2 ($1)')
    .replace(/([a-zA-Z])(\d+)$/g, '$1 $2')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    .replace('(xl)', '(XL)')

const generalEffects = general
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((effect) => ({ ...effect, key: effect.safe_name, safe_name: undefined }))
  .map((effect) => createEffect(effect, { allowDurational: true }))
  .join(',\r')

const giveWeaponEffects = Object.entries(weapons)
  .map(([key, value]) => ({ ...value[0], key }))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((effect) => createEffect(effect, { prefix: 'giveweapon', folder: 'give_weapon', overlayPrefix: 'Give' }))
  .join(',\r')

const takeWeaponEffects = Object.entries(weapons)
  .map(([key, value]) => ({ ...value[0], key }))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((effect) => createEffect(effect, { prefix: 'takeweapon', folder: 'take_weapon', overlayPrefix: 'Take' }))
  .join(',\r')

const placeItemEffects = Object.entries(items)
  .map(([key, value]) => {
    const { name } = value
    return { ...value, key, name: name || getNameFromKey(key) }
  })
  .filter(({ key }) => spawnableItems.includes(key))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((effect) => createEffect(effect, { prefix: 'placeitem', folder: 'place_item', overlayPrefix: 'Place' }))
  .join(',\r')

const playMusicEffects = musicLibrary
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((effect) => ({ ...effect, key: effect.id.toLowerCase(), id: undefined }))
  .map((effect) => createEffect(effect, { prefix: 'playmusic', folder: 'play_music' }))
  .join(',\r')

const spawnEnemyEffects = Object.entries(enemies)
  .filter(([key]) => !key.match(/^(?:BOSS_|test|undefined)/))
  .map(([key, value]) => {
    let { bName: name, bDesc: description } = value[0]

    const enemyOverride = enemyNames.find(({ id }) => id === key)
    if (enemyOverride) name = enemyOverride.name

    if (!name) {
      const original = Object.values(enemies).find((v) => v[0]?.bVariants?.includes(key))
      const variantID = (key.match(/\d+$/) || [])[0]
      if (original && variantID) name = `${original[0].bName} ${variantID}`
      if (!name) name = getNameFromKey(key)
    }

    return { ...value[0], name, key, description }
  })
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((effect) => createEffect(effect, { prefix: 'spawnenemy', folder: 'spawn_enemy', overlayPrefix: 'Spawn' }))
  .join(',\r')

const spawnBossEffects = Object.entries(enemies)
  .filter(([key]) => key.match(/^BOSS_/))
  .map(([key, value]) => {
    let { bName: name, bDesc: description } = value[0]
    const enemyOverride = enemyNames.find(({ id }) => id === key)
    if (enemyOverride) name = enemyOverride.name

    if (!name) name = getNameFromKey(key)

    return { ...value[0], name, key, description }
  })
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((effect) => createEffect(effect, { prefix: 'spawnboss', folder: 'spawn_boss', overlayPrefix: 'Spawn Boss' }))
  .join(',\r')

const pack = `${header}
${indent}// General Effects
${generalEffects},

${indent}// Spawn Enemy Effects
${indent}new("Spawn Enemy", "spawn_enemy", ItemKind.Folder),
${spawnEnemyEffects},

${indent}// Give Weapon Effects
${indent}new("Give Weapon", "give_weapon", ItemKind.Folder),
${giveWeaponEffects},

${indent}// Take Weapon Effects
${indent}new("Take Weapon", "take_weapon", ItemKind.Folder),
${takeWeaponEffects},

${indent}// Place Item Effects
${indent}new("Place Item", "place_item", ItemKind.Folder),
${placeItemEffects},

${indent}// Spawn Boss Effects
${indent}new("Spawn Boss", "spawn_boss", ItemKind.Folder),
${spawnBossEffects},
${footer}`

// ${indent}// Play Music Effects
// ${indent}new("Play Music", "play_music", ItemKind.Folder),
// ${playMusicEffects},

const dist = resolve(__dirname, '..', 'dist')
mkdirp.sync(dist)
writeFileSync(resolve(dist, 'VampireSurvivors.cs'), pack)
writeFileSync(
  resolve(__dirname, '..', 'VampireSurvivorsEffects.json'),
  JSON.stringify(Object.fromEntries(effectsMap), null, 2)
)
