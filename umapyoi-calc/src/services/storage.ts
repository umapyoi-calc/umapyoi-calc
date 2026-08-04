import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '../lib/firebase'

export async function getStorageFileUrl(filePath: string): Promise<string> {
  if (!filePath) {
    return ''
  }

  try {
    const fileRef = ref(storage, filePath)
    return await getDownloadURL(fileRef)
  } catch (error) {
    console.warn(`Storage path could not be resolved: ${filePath}`, error)
    return ''
  }
}
