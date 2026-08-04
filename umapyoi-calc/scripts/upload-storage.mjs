import { existsSync, readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

const ROOT_DIR = process.cwd()
const OLD_PUBLIC_DIR = process.env.OLD_PUBLIC_DIR ?? path.resolve(ROOT_DIR, '../old/public')
const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? path.resolve(ROOT_DIR, 'serviceAccountKey.json')

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  throw new Error(
    `Service account key not found at ${SERVICE_ACCOUNT_PATH}. Set FIREBASE_SERVICE_ACCOUNT_PATH or place serviceAccountKey.json in project root.`,
  )
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'))
const bucketName = process.env.FIREBASE_STORAGE_BUCKET_NAME ?? `${serviceAccount.project_id}.firebasestorage.app`

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: bucketName,
  })
}

const bucket = getStorage().bucket()
const folders = ['main', 'outfits', 'racewear']

async function uploadFolder(folderName) {
  const folderPath = path.join(OLD_PUBLIC_DIR, folderName)
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

    await bucket.upload(sourcePath, {
      destination,
      metadata: {
        cacheControl: 'public,max-age=31536000,immutable',
      },
    })

    uploadedCount += 1
    console.log(`[ok] Uploaded: ${destination}`)
  }

  return uploadedCount
}

async function main() {
  console.log(`Using Storage bucket: ${bucket.name}`)
  console.log(`Reading local files from: ${OLD_PUBLIC_DIR}`)

  let totalUploaded = 0

  for (const folder of folders) {
    const count = await uploadFolder(folder)
    totalUploaded += count
  }

  console.log(`Done. Uploaded ${totalUploaded} file(s) to Firebase Storage.`)
}

main().catch((error) => {
  console.error('Storage upload failed:', error)
  process.exit(1)
})
