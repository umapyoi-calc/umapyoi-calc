import { existsSync, readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

const ROOT_DIR = process.cwd()
const DEFAULT_ACTIVE_PUBLIC_DIR = path.resolve(ROOT_DIR, 'public')
const DEFAULT_LEGACY_PUBLIC_DIR = path.resolve(ROOT_DIR, '../old/public')
const DEFAULT_SERVICE_ACCOUNT_PATH = path.resolve(ROOT_DIR, 'serviceAccountKey.json')
const DEFAULT_FOLDERS = ['main', 'outfits', 'racewear']

function resolveDefaultPublicDir() {
  if (existsSync(DEFAULT_ACTIVE_PUBLIC_DIR)) {
    return DEFAULT_ACTIVE_PUBLIC_DIR
  }

  return DEFAULT_LEGACY_PUBLIC_DIR
}

function printHelp() {
  console.log(`
Upload image assets to Firebase Storage.

Usage:
  node scripts/upload-storage.mjs [options]

Options:
  --public-dir <path>          Source directory containing main/outfits/racewear.
                               Default: public (fallback: ../old/public).
  --folders <csv>              Comma separated folder names (default: main,outfits,racewear).
  --bucket <name>              Target Storage bucket name.
  --service-account <path>     Service account JSON path.
  --dry-run                    Validate files and print planned uploads only.
  -h, --help                   Show this help message.

Environment aliases:
  PUBLIC_DIR (preferred) or OLD_PUBLIC_DIR
  FIREBASE_STORAGE_BUCKET_NAME
  FIREBASE_SERVICE_ACCOUNT_PATH
`)
}

function parseFolderList(value) {
  if (!value) {
    return DEFAULT_FOLDERS
  }

  const folders = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return folders.length ? folders : DEFAULT_FOLDERS
}

function parseOptions() {
  const { values } = parseArgs({
    options: {
      'public-dir': { type: 'string' },
      folders: { type: 'string' },
      bucket: { type: 'string' },
      'service-account': { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: false,
  })

  if (values.help) {
    printHelp()
    process.exit(0)
  }

  return {
    publicDir: path.resolve(
      ROOT_DIR,
      values['public-dir'] ?? process.env.PUBLIC_DIR ?? process.env.OLD_PUBLIC_DIR ?? resolveDefaultPublicDir(),
    ),
    bucketName: values.bucket ?? process.env.FIREBASE_STORAGE_BUCKET_NAME ?? '',
    serviceAccountPath: path.resolve(
      ROOT_DIR,
      values['service-account'] ?? process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? DEFAULT_SERVICE_ACCOUNT_PATH,
    ),
    dryRun: values['dry-run'],
    folders: parseFolderList(values.folders),
  }
}

const options = parseOptions()
let bucket = null

function getBucket() {
  if (bucket) {
    return bucket
  }

  if (!existsSync(options.serviceAccountPath)) {
    throw new Error(
      `Service account key not found at ${options.serviceAccountPath}. Set FIREBASE_SERVICE_ACCOUNT_PATH, use --service-account, or place serviceAccountKey.json in project root.`,
    )
  }

  const serviceAccount = JSON.parse(readFileSync(options.serviceAccountPath, 'utf8'))
  const resolvedBucketName = options.bucketName || `${serviceAccount.project_id}.firebasestorage.app`

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: resolvedBucketName,
    })
  }

  bucket = getStorage().bucket()
  return bucket
}

async function uploadFolder(folderName) {
  const folderPath = path.join(options.publicDir, folderName)
  if (!existsSync(folderPath)) {
    console.warn(`[skip] Folder not found: ${folderPath}`)
    return 0
  }

  const entries = await readdir(folderPath, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile())

  let uploadedCount = 0

  for (const file of files) {
    const sourcePath = path.join(folderPath, file.name)
    const destination = `${folderName}/${file.name}`

    if (options.dryRun) {
      console.log(`[dry-run] Would upload: ${destination}`)
    } else {
      await getBucket().upload(sourcePath, {
        destination,
        metadata: {
          cacheControl: 'public,max-age=31536000,immutable',
        },
      })

      console.log(`[ok] Uploaded: ${destination}`)
    }

    uploadedCount += 1
  }

  return uploadedCount
}

async function main() {
  console.log(`Reading local files from: ${options.publicDir}`)
  console.log(`Folders: ${options.folders.join(', ')}`)
  console.log(`Mode: ${options.dryRun ? 'dry-run (no writes)' : 'write'}`)

  if (options.dryRun) {
    console.log('Dry-run does not require Firebase credentials.')
  } else {
    console.log(`Using Storage bucket: ${getBucket().name}`)
  }

  let totalUploaded = 0

  for (const folder of options.folders) {
    const count = await uploadFolder(folder)
    totalUploaded += count
  }

  if (options.dryRun) {
    console.log(`Done. Dry-run validated ${totalUploaded} file(s).`)
    return
  }

  console.log(`Done. Uploaded ${totalUploaded} file(s) to Firebase Storage.`)
}

main().catch((error) => {
  console.error('Storage upload failed:', error)
  process.exit(1)
})
