import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface CharacterImages {
  bannerPath: string
  mainPath: string
  racewearPath: string
}

export interface CharacterStats {
  speed: number
  stamina: number
  power: number
  guts: number
  wit: number
}

export interface CharacterTrack {
  turf: string
  dirt: string
}

export interface CharacterDistance {
  sprint: string
  mile: string
  medium: string
  long: string
}

export interface CharacterStyle {
  front: string
  pace: string
  late: string
  end: string
}

export interface CharacterGrowthRate {
  speed: string
  stamina: string
  power: string
  guts: string
  wit: string
}

export interface CharacterDetails {
  intro: string
  description: string
  birthday: string
  height: string
  measurement1: string
  measurement2: string
  measurement3: string
  weight: string
  grade: string
  residence: string
  likes: string
  dislikes: string
  earsFact: string
  tailFact: string
  shoeSizeL: string
  shoeSizeR: string
  familyFact: string
}

export interface CharacterDocument {
  id: number
  nameEN: string
  nameJP: string
  images?: CharacterImages
  stats?: CharacterStats
  track?: CharacterTrack
  distance?: CharacterDistance
  style?: CharacterStyle
  growthRate?: CharacterGrowthRate
  details?: CharacterDetails
}

export interface CardDocument {
  id: number
  caption: string
  bannerPath: string
}

export async function getCharacterById(id: string): Promise<CharacterDocument | null> {
  const characterRef = doc(db, 'characters', id)
  const snapshot = await getDoc(characterRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data() as CharacterDocument
  return data
}

export async function getCharacters(maxCharacters = 120): Promise<CharacterDocument[]> {
  const charactersRef = collection(db, 'characters')
  const charactersQuery =
    maxCharacters > 0
      ? query(charactersRef, orderBy('id', 'asc'), limit(maxCharacters))
      : query(charactersRef, orderBy('id', 'asc'))
  const snapshot = await getDocs(charactersQuery)

  return snapshot.docs.map((characterDoc) => characterDoc.data() as CharacterDocument)
}

export async function getCards(maxCards = 12): Promise<CardDocument[]> {
  const cardsRef = collection(db, 'cards')
  const cardsQuery =
    maxCards > 0
      ? query(cardsRef, orderBy('id', 'asc'), limit(maxCards))
      : query(cardsRef, orderBy('id', 'asc'))
  const snapshot = await getDocs(cardsQuery)

  return snapshot.docs.map((cardDoc) => cardDoc.data() as CardDocument)
}
