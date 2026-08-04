import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const ROOT_DIR = process.cwd()
const OLD_DATA_DIR = process.env.OLD_DATA_DIR ?? path.resolve(ROOT_DIR, '../old/src/data')
const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? path.resolve(ROOT_DIR, 'serviceAccountKey.json')

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  throw new Error(
    `Service account key not found at ${SERVICE_ACCOUNT_PATH}. Set FIREBASE_SERVICE_ACCOUNT_PATH or place serviceAccountKey.json in project root.`,
  )
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'))

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const db = getFirestore()

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

function normalizeCharacter(character) {
  return {
    id: toNumber(character.id),
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
    source: 'old-json',
    updatedAt: FieldValue.serverTimestamp(),
  }
}

function normalizeCard(card) {
  return {
    id: toNumber(card.id),
    caption: card.caption ?? '',
    bannerPath: stripPublicPrefix(card.banner),
    source: 'old-json',
    updatedAt: FieldValue.serverTimestamp(),
  }
}

async function batchUpsert(collectionName, docs) {
  const chunkSize = 400

  for (let index = 0; index < docs.length; index += chunkSize) {
    const chunk = docs.slice(index, index + chunkSize)
    const batch = db.batch()

    for (const item of chunk) {
      const docId = String(item.id)
      const ref = db.collection(collectionName).doc(docId)
      batch.set(ref, item, { merge: true })
    }

    await batch.commit()
    console.log(`[ok] ${collectionName}: committed ${chunk.length} document(s)`)
  }
}

async function main() {
  const characterPath = path.join(OLD_DATA_DIR, 'character_data.json')
  const cardsPath = path.join(OLD_DATA_DIR, 'card_imgs.json')

  if (!existsSync(characterPath)) {
    throw new Error(`character_data.json not found in ${OLD_DATA_DIR}`)
  }

  if (!existsSync(cardsPath)) {
    throw new Error(`card_imgs.json not found in ${OLD_DATA_DIR}`)
  }

  const charactersRaw = JSON.parse(readFileSync(characterPath, 'utf8'))
  const cardsRaw = JSON.parse(readFileSync(cardsPath, 'utf8'))

  const characters = Array.isArray(charactersRaw) ? charactersRaw.map(normalizeCharacter) : []
  const cards = Array.isArray(cardsRaw) ? cardsRaw.map(normalizeCard) : []

  console.log(`Preparing ${characters.length} character document(s)`)
  console.log(`Preparing ${cards.length} card document(s)`)

  await batchUpsert('characters', characters)
  await batchUpsert('cards', cards)

  console.log('Done. Firestore seed completed.')
}

main().catch((error) => {
  console.error('Firestore seed failed:', error)
  process.exit(1)
})
