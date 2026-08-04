import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCards, getCharacters, type CardDocument } from '../services/characters'
import { getStorageFileUrl } from '../services/storage'

interface CardPreview extends CardDocument {
  imageUrl: string
  displayName: string
}

const borderPalette = [
  '#EE6DCB',
  '#29BD70',
  '#3376D2',
  '#EA504A',
  '#444745',
  '#3A7AD2',
  '#DA3C57',
  '#D4C200',
  '#4F64D8',
  '#73C032',
  '#3A34AC',
  '#2185D0',
]

const stripBannerSuffix = (caption: string): string => caption.replace(/\s*banner$/i, '').trim()

const CharactersCard = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Loading cards from Firestore...')
  const [cards, setCards] = useState<CardPreview[]>([])

  useEffect(() => {
    let isMounted = true

    const loadCards = async () => {
      try {
        const [cardsDocs, charactersDocs] = await Promise.all([getCards(120), getCharacters(120)])

        const namesById = new Map<number, string>(
          charactersDocs.map((character) => [
            character.id,
            character.nameEN || character.nameJP || `Uma ${character.id}`,
          ]),
        )

        const cardsWithImages = await Promise.all(
          cardsDocs.map(async (card) => {
            const imageUrl = await getStorageFileUrl(card.bannerPath)
            const fallbackName = stripBannerSuffix(card.caption) || `Uma ${card.id}`

            return {
              ...card,
              imageUrl,
              displayName: namesById.get(card.id) ?? fallbackName,
            }
          }),
        )

        if (!isMounted) {
          return
        }

        setCards(cardsWithImages)
        setStatus(`Loaded ${cardsWithImages.length} cards from Firestore + Storage`)
      } catch (error) {
        console.error('Cards page load error:', error)
        if (isMounted) {
          setStatus('Could not load cards. Check Firestore/Storage rules and data.')
        }
      }
    }

    void loadCards()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 w-full flex items-start justify-center pt-28 pb-12 px-4">
      <div className="flex flex-col items-center w-full max-w-7xl gap-6">
        <h1 className="text-4xl md:text-6xl font-bold text-black text-center">Characters</h1>
        <p className="text-sm text-gray-600 text-center">{status}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 justify-items-center w-full">
          {cards.map((card, index) => {
            const borderColor = borderPalette[index % borderPalette.length]

            return (
              <button
                key={card.id}
                onClick={() => navigate(`/character?id=${card.id}`)}
                className="relative w-[181px] h-[238px] rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 shadow-md"
                type="button"
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.displayName}
                    className="absolute inset-0 w-full h-full object-cover border-4 rounded-lg bg-white"
                    style={{ borderColor }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0 w-full h-full border-4 rounded-lg bg-white flex items-center justify-center text-sm text-gray-500"
                    style={{ borderColor }}
                  >
                    No image
                  </div>
                )}

                <span className="border-2 border-[#EE6DCB] bg-white rounded-lg absolute bottom-2 left-2 right-2 text-black font-bold text-sm text-center px-1 py-0.5">
                  {card.displayName}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CharactersCard