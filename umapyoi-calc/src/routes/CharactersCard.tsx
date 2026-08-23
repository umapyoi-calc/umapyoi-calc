import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCards, getCharacters, type CardDocument } from '../services/characters'
import { getStorageFileUrl } from '../services/storage'




interface CardPreview extends CardDocument {
  imageUrl: string
  displayName: string
}

const borderPalette = [
  '#9b317f',
  '#16814a',
  '#194d96',
  '#7e1815',
  '#232725',
  '#163b70',
  '#791828',
  '#645c00',
  '#263068',
  '#365a19',
  '#1f1c5e',
  '#0f3a5a',
]

const stripBannerSuffix = (caption: string): string => caption.replace(/\s*banner$/i, '').trim()

const ITEMS_PER_PAGE = 24

const CharactersCard = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Loading cards from Firestore...')
  const [currentPage, setCurrentPage] = useState(1)
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




  {/* TODO: Busqueda de personajes por nombre (Talves hasta por datos especificos? Depende de cuanta información esto traiga) */}




  const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE)
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  
  const currentCards = cards.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  

  return (
    <div className="min-h-screen bg-black w-full flex items-start justify-center pt-28 pb-12 px-4">

            <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[900px] bg-[#1393fb] rounded-full blur-[260px] opacity-20"></div>
      <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[900px] bg-[#e316c8] rounded-full blur-[260px] opacity-15"></div>

      <div className="flex flex-col items-center w-full max-w-7xl gap-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Characters</h1>
        <p className="text-sm text-gray-400 text-center">{status}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 justify-items-center w-full">

          
{currentCards.map((card, index) => {
  const globalIndex = startIndex + index 
  const borderColor = borderPalette[globalIndex % borderPalette.length]
  const bgColorWithOpacity = `${borderColor}33`;

  return (
    <button
      key={card.id}
      onClick={() => navigate(`/character?id=${card.id}`)}
      className="group relative w-[181px] h-[238px] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] backdrop-blur-md"
      style={{ backgroundColor: bgColorWithOpacity }} 
      type="button"
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.displayName}
          className="absolute inset-0 w-full h-full object-cover border-4 rounded-2xl backdrop-blur-xl transition-opacity duration-300 group-hover:opacity-90"
          style={{ borderColor }}
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full border-4 rounded-2xl bg-black/40 flex items-center justify-center text-sm text-gray-500 font-medium backdrop-blur-sm"
          style={{ borderColor }}
        >
          No image
        </div>
      )}

      <span 
        className="border bg-black/70 backdrop-blur-md rounded-xl absolute bottom-2 left-2 right-2 text-white font-bold text-sm text-center px-2 py-1.5 shadow-xl truncate"
        style={{ borderColor }}
      >
        {card.displayName}
      </span>
    </button>
  )
})}
        </div>
      


  {totalPages > 1 && (
<div className="flex items-center gap-4 mt-12 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white font-medium disabled:opacity-30 disabled:hover:bg-white/10 disabled:cursor-not-allowed transition-colors shadow-sm"
  >
    Previous
  </button>
  
  <span className="text-sm font-bold text-gray-400 tracking-wider uppercase px-2">
    Page <span className="text-pink-400">{currentPage}</span> of {totalPages}
  </span>
  
  <button
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white font-medium disabled:opacity-30 disabled:hover:bg-white/10 disabled:cursor-not-allowed transition-colors shadow-sm"
  >
    Next
  </button>
</div>



  )}
      
      </div>
    </div>
  )
}

export default CharactersCard