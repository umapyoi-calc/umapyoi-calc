import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const ROOT_DIR = process.cwd()
const DEFAULT_ACTIVE_DATA_DIR = path.resolve(ROOT_DIR, 'src/data')
const DEFAULT_LEGACY_DATA_DIR = path.resolve(ROOT_DIR, '../old/src/data')
const DEFAULT_SERVICE_ACCOUNT_PATH = path.resolve(ROOT_DIR, 'serviceAccountKey.json')
const DEFAULT_CHARACTERS_FILE = 'character_data.json'
const DEFAULT_CARDS_FILE = 'card_imgs.json'

function resolveDefaultDataDir() {
  if (existsSync(DEFAULT_ACTIVE_DATA_DIR)) {
    return DEFAULT_ACTIVE_DATA_DIR
  }

  return DEFAULT_LEGACY_DATA_DIR
}

function printHelp() {
  console.log(`
Seed Firestore from local JSON files.

Usage:
  node scripts/seed-firestore.mjs [options]

Options:
  --data-dir <path>            Base directory for default JSON files.
                               Default: src/data (fallback: ../old/src/data).
  --characters-file <path>     Character JSON file path. If only a file name is passed,
                               it will be resolved inside --data-dir.
  --cards-file <path>          Card JSON file path. If only a file name is passed,
                               it will be resolved inside --data-dir.
  --service-account <path>     Service account JSON path.
  --only <all|characters|cards>
                               Seed only one collection (default: all).
  --strict                     Stop on invalid/duplicate IDs.
  --dry-run                    Validate and print summary without writing to Firestore.
  -h, --help                   Show this help message.

Environment aliases:
  DATA_DIR (preferred) or OLD_DATA_DIR
  FIREBASE_SERVICE_ACCOUNT_PATH
`)
}

function resolveDataFilePath(dataDir, customPath, defaultFileName) {
  if (!customPath) {
    return path.join(dataDir, defaultFileName)
  }

  if (path.isAbsolute(customPath)) {
    return customPath
  }

  const isSimpleFileName = !customPath.includes('/') && !customPath.includes('\\')
  return isSimpleFileName ? path.join(dataDir, customPath) : path.resolve(ROOT_DIR, customPath)
}

function parseOptions() {
  const { values } = parseArgs({
    options: {
      'data-dir': { type: 'string' },
      'characters-file': { type: 'string' },
      'cards-file': { type: 'string' },
      'service-account': { type: 'string' },
      only: { type: 'string' },
      strict: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: false,
  })

  if (values.help) {
    printHelp()
    process.exit(0)
  }

  const onlyValue = String(values.only ?? 'all').toLowerCase()
  if (!['all', 'characters', 'cards'].includes(onlyValue)) {
    throw new Error(`Invalid value for --only: ${values.only}. Use all, characters, or cards.`)
  }

  const dataDir = path.resolve(
    ROOT_DIR,
    values['data-dir'] ?? process.env.DATA_DIR ?? process.env.OLD_DATA_DIR ?? resolveDefaultDataDir(),
  )
  const serviceAccountPath = path.resolve(
    ROOT_DIR,
    values['service-account'] ?? process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? DEFAULT_SERVICE_ACCOUNT_PATH,
  )

  return {
    only: onlyValue,
    strict: values.strict,
    dryRun: values['dry-run'],
    dataDir,
    serviceAccountPath,
    charactersPath: resolveDataFilePath(dataDir, values['characters-file'], DEFAULT_CHARACTERS_FILE),
    cardsPath: resolveDataFilePath(dataDir, values['cards-file'], DEFAULT_CARDS_FILE),
  }
}

const options = parseOptions()
let db = null

function getDb() {
  if (db) {
    return db
  }

  if (!existsSync(options.serviceAccountPath)) {
    throw new Error(
      `Service account key not found at ${options.serviceAccountPath}. Set FIREBASE_SERVICE_ACCOUNT_PATH, use --service-account, or place serviceAccountKey.json in project root.`,
    )
  }

  const serviceAccount = JSON.parse(readFileSync(options.serviceAccountPath, 'utf8'))

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    })
  }

  db = getFirestore()
  return db
}

function stripPublicPrefix(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.replace(/^public\//, '')
}

function toNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function toValidId(value) {
  const numeric = Number(value)
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null
  }

  return numeric
}

function normalizeCharacter(character) {
  const id = toValidId(character?.id)
  if (id === null) {
    return null
  }

  return {
    id,
    nameEN: character.nameEN ?? '',
    nameJP: character.nameJP ?? '',
    images: {
      bannerPath: stripPublicPrefix(character.images?.banner),
      mainPath: stripPublicPrefix(character.images?.main),
      racewearPath: stripPublicPrefix(character.images?.racewear),
    },
    stats: {
      speed: toNumber(character.stats?.speed),
      stamina: toNumber(character.stats?.stamina),
      power: toNumber(character.stats?.power),
      guts: toNumber(character.stats?.guts),
      wit: toNumber(character.stats?.wit),
    },
    track: {
      turf: character.Track?.Turf ?? '',
      dirt: character.Track?.Dirt ?? '',
    },
    distance: {
      sprint: character.Distance?.sprint ?? '',
      mile: character.Distance?.mile ?? '',
      medium: character.Distance?.medium ?? '',
      long: character.Distance?.long ?? '',
    },
    style: {
      front: character.Style?.front ?? '',
      pace: character.Style?.pace ?? '',
      late: character.Style?.late ?? '',
      end: character.Style?.end ?? '',
    },
    growthRate: {
      speed: character['Growth Rate']?.['growth-speed'] ?? '-',
      stamina: character['Growth Rate']?.['growth-stamina'] ?? '-',
      power: character['Growth Rate']?.['growth-power'] ?? '-',
      guts: character['Growth Rate']?.['growth-guts'] ?? '-',
      wit: character['Growth Rate']?.['growth-wit'] ?? '-',
    },
    details: {
      intro: character.Details?.intro ?? '',
      description: character.Details?.description ?? '',
      birthday: character.Details?.birthday ?? '',
      height: character.Details?.height ?? '',
      measurement1: character.Details?.measurement1 ?? '',
      measurement2: character.Details?.measurement2 ?? '',
      measurement3: character.Details?.measurement3 ?? '',
      weight: character.Details?.weight ?? '',
      grade: character.Details?.grade ?? '',
      residence: character.Details?.residence ?? '',
      likes: character.Details?.likes ?? '',
      dislikes: character.Details?.dislikes ?? '',
      earsFact: character.Details?.earsFact ?? '',
      tailFact: character.Details?.tailFact ?? '',
      shoeSizeL: character.Details?.shoeSizeL ?? '',
      shoeSizeR: character.Details?.shoeSizeR ?? '',
      familyFact: character.Details?.familyFact ?? '',
    },
    source: 'json-import',
    updatedAt: FieldValue.serverTimestamp(),
  }
}

function normalizeCard(card) {
  const id = toValidId(card?.id)
  if (id === null) {
    return null
  }

  return {
    id,
    caption: card.caption ?? '',
    bannerPath: stripPublicPrefix(card.banner),
    source: 'json-import',
    updatedAt: FieldValue.serverTimestamp(),
  }
}

function readJsonArray(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} file not found: ${filePath}`)
  }

  const parsed = JSON.parse(readFileSync(filePath, 'utf8'))
  if (!Array.isArray(parsed)) {
    throw new Error(`${label} must contain a JSON array: ${filePath}`)
  }

  return parsed
}

function reportIssue(message, strict) {
  if (strict) {
    throw new Error(message)
  }

  console.warn(`[skip] ${message}`)
}

function normalizeCollection(rawDocs, normalizeDoc, label, strict) {
  const docs = []
  const seenIds = new Set()
  let skippedCount = 0

  rawDocs.forEach((rawDoc, index) => {
    const normalized = normalizeDoc(rawDoc)

    if (!normalized) {
      skippedCount += 1
      reportIssue(`${label}[${index}] has invalid id: ${rawDoc?.id ?? '(missing)'}`, strict)
      return
    }

    const docId = String(normalized.id)
    if (seenIds.has(docId)) {
      skippedCount += 1
      reportIssue(`${label}[${index}] has duplicate id: ${docId}`, strict)
      return
    }

    seenIds.add(docId)
    docs.push(normalized)
  })

  return {
    docs,
    skippedCount,
  }
}

async function batchUpsert(collectionName, docs) {
  if (!docs.length) {
    console.log(`[skip] ${collectionName}: nothing to write`)
    return
  }

  const firestore = getDb()

  const chunkSize = 400

  for (let index = 0; index < docs.length; index += chunkSize) {
    const chunk = docs.slice(index, index + chunkSize)
    const batch = firestore.batch()

    for (const item of chunk) {
      const docId = String(item.id)
      const ref = firestore.collection(collectionName).doc(docId)
      batch.set(ref, item, { merge: true })
    }

    await batch.commit()
    console.log(`[ok] ${collectionName}: committed ${chunk.length} document(s)`)
  }
}

async function main() {
  const shouldSeedCharacters = options.only === 'all' || options.only === 'characters'
  const shouldSeedCards = options.only === 'all' || options.only === 'cards'

  console.log(`Data dir: ${options.dataDir}`)
  console.log(`Characters file: ${options.charactersPath}`)
  console.log(`Cards file: ${options.cardsPath}`)
  console.log(`Mode: ${options.dryRun ? 'dry-run (no writes)' : 'write'}`)

  if (!shouldSeedCharacters && !shouldSeedCards) {
    throw new Error('Nothing to seed. Use --only with all, characters, or cards.')
  }

  let totalWritten = 0

  if (shouldSeedCharacters) {
    const charactersRaw = readJsonArray(options.charactersPath, 'Characters JSON')
    const { docs: characters, skippedCount } = normalizeCollection(
      charactersRaw,
      normalizeCharacter,
      'characters',
      options.strict,
    )

    console.log(`Preparing ${characters.length} character document(s)`)
    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} invalid character document(s)`)
    }

    if (!options.dryRun) {
      await batchUpsert('characters', characters)
      totalWritten += characters.length
    }
  }

  if (shouldSeedCards) {
    const cardsRaw = readJsonArray(options.cardsPath, 'Cards JSON')
    const { docs: cards, skippedCount } = normalizeCollection(cardsRaw, normalizeCard, 'cards', options.strict)

    console.log(`Preparing ${cards.length} card document(s)`)
    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} invalid card document(s)`)
    }

    if (!options.dryRun) {
      await batchUpsert('cards', cards)
      totalWritten += cards.length
    }
  }

  if (options.dryRun) {
    console.log('Done. Validation completed (dry-run, no writes performed).')
    return
  }

  console.log(`Done. Firestore seed completed. Wrote ${totalWritten} document(s).`)
}

main().catch((error) => {
  console.error('Firestore seed failed:', error)
  process.exit(1)
})
