import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCharacterById, type CharacterDocument } from '../services/characters'
import { getStorageFileUrl } from '../services/storage'

interface CharacterImagesPreview {
  mainUrl: string
  bannerUrl: string
  racewearUrl: string
}

const getTextValue = (value: string | number | undefined): string => {
  if (value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

const CharactersInfo = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const umaId = searchParams.get('id') ?? '1001'

  const [status, setStatus] = useState('Loading character from Firestore...')
  const [character, setCharacter] = useState<CharacterDocument | null>(null)
  const [images, setImages] = useState<CharacterImagesPreview>({
    mainUrl: '',
    bannerUrl: '',
    racewearUrl: '',
  })

  useEffect(() => {
    let isMounted = true

    const loadCharacter = async () => {
      try {
        const data = await getCharacterById(umaId)

        if (!isMounted) {
          return
        }

        if (!data) {
          setCharacter(null)
          setStatus(`Character ${umaId} was not found in Firestore.`)
          setImages({ mainUrl: '', bannerUrl: '', racewearUrl: '' })
          return
        }

        setCharacter(data)
        setStatus('Character loaded from Firestore')

        const [mainUrl, bannerUrl, racewearUrl] = await Promise.all([
          getStorageFileUrl(data.images?.mainPath ?? ''),
          getStorageFileUrl(data.images?.bannerPath ?? ''),
          getStorageFileUrl(data.images?.racewearPath ?? ''),
        ])

        if (!isMounted) {
          return
        }

        setImages({ mainUrl, bannerUrl, racewearUrl })
      } catch (error) {
        console.error('Character page load error:', error)
        if (isMounted) {
          setCharacter(null)
          setImages({ mainUrl: '', bannerUrl: '', racewearUrl: '' })
          setStatus('Could not load character. Check Firestore/Storage and env vars.')
        }
      }
    }

    void loadCharacter()

    return () => {
      isMounted = false
    }
  }, [umaId])

  const detailRows: Array<{ label: string; value: string | number | undefined }> = character
    ? [
        { label: 'Birthday', value: character.details?.birthday },
        { label: 'Height', value: character.details?.height },
        {
          label: 'Measurements',
          value:
            character.details?.measurement1 &&
            character.details?.measurement2 &&
            character.details?.measurement3
              ? `${character.details.measurement1} / ${character.details.measurement2} / ${character.details.measurement3}`
              : undefined,
        },
        { label: 'Weight', value: character.details?.weight },
        { label: 'Grade', value: character.details?.grade },
        { label: 'Residence', value: character.details?.residence },
        { label: 'Likes', value: character.details?.likes },
        { label: 'Dislikes', value: character.details?.dislikes },
        { label: 'Ears Fact', value: character.details?.earsFact },
        { label: 'Tail Fact', value: character.details?.tailFact },
        { label: 'Shoe Size L', value: character.details?.shoeSizeL },
        { label: 'Shoe Size R', value: character.details?.shoeSizeR },
        { label: 'Family Fact', value: character.details?.familyFact },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-50 w-full p-4 md:p-8 pt-28">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/characters')}
          className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          type="button"
        >
          Back to characters
        </button>

        <p className="text-sm text-gray-600 mb-4">{status}</p>

        {!character ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">No character data available</h1>
            <p className="mt-3 text-gray-600">ID: {umaId}</p>
            <p className="mt-2 text-gray-500">
              If this is a new character, seed Firestore again or add the document manually.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Uma Profile</h1>

            <h2 className="text-2xl font-semibold mb-4">General Information</h2>
            <h3 className="text-xl mb-1 text-gray-700">{getTextValue(character.nameJP)}</h3>
            <h3 className="text-xl mb-1 text-gray-700">{getTextValue(character.nameEN)}</h3>
            <h3 className="text-xl mb-4 text-gray-700">ID: {getTextValue(character.id)}</h3>

            <p className="text-gray-700 mb-2">{getTextValue(character.details?.intro)}</p>
            <p className="text-gray-600 mb-6">{getTextValue(character.details?.description)}</p>

            {images.mainUrl ? (
              <img
                src={images.mainUrl}
                className="max-w-xs rounded-lg shadow-md"
                alt={character.nameEN || 'Uma Character'}
              />
            ) : (
              <div className="max-w-xs h-56 rounded-lg shadow-md bg-gray-100 flex items-center justify-center text-gray-500">
                Main image unavailable
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Stats</h2>
              <div className="flex gap-8 flex-wrap">
                <div>
                  <span className="font-semibold">Speed:</span> {getTextValue(character.stats?.speed)}
                </div>
                <div>
                  <span className="font-semibold">Stamina:</span> {getTextValue(character.stats?.stamina)}
                </div>
                <div>
                  <span className="font-semibold">Power:</span> {getTextValue(character.stats?.power)}
                </div>
                <div>
                  <span className="font-semibold">Guts:</span> {getTextValue(character.stats?.guts)}
                </div>
                <div>
                  <span className="font-semibold">Wit:</span> {getTextValue(character.stats?.wit)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Track</h2>
              <div className="flex gap-8 flex-wrap">
                <div>
                  <span className="font-semibold">Turf:</span> {getTextValue(character.track?.turf)}
                </div>
                <div>
                  <span className="font-semibold">Dirt:</span> {getTextValue(character.track?.dirt)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Distance</h2>
              <div className="flex gap-8 flex-wrap">
                <div>
                  <span className="font-semibold">Sprint:</span> {getTextValue(character.distance?.sprint)}
                </div>
                <div>
                  <span className="font-semibold">Mile:</span> {getTextValue(character.distance?.mile)}
                </div>
                <div>
                  <span className="font-semibold">Medium:</span> {getTextValue(character.distance?.medium)}
                </div>
                <div>
                  <span className="font-semibold">Long:</span> {getTextValue(character.distance?.long)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Style</h2>
              <div className="flex gap-8 flex-wrap">
                <div>
                  <span className="font-semibold">Front:</span> {getTextValue(character.style?.front)}
                </div>
                <div>
                  <span className="font-semibold">Pace:</span> {getTextValue(character.style?.pace)}
                </div>
                <div>
                  <span className="font-semibold">Late:</span> {getTextValue(character.style?.late)}
                </div>
                <div>
                  <span className="font-semibold">End:</span> {getTextValue(character.style?.end)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Growth Rate</h2>
              <div className="flex gap-8 flex-wrap">
                <div>
                  <span className="font-semibold">Speed:</span> {getTextValue(character.growthRate?.speed)}
                </div>
                <div>
                  <span className="font-semibold">Stamina:</span> {getTextValue(character.growthRate?.stamina)}
                </div>
                <div>
                  <span className="font-semibold">Power:</span> {getTextValue(character.growthRate?.power)}
                </div>
                <div>
                  <span className="font-semibold">Guts:</span> {getTextValue(character.growthRate?.guts)}
                </div>
                <div>
                  <span className="font-semibold">Wit:</span> {getTextValue(character.growthRate?.wit)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {detailRows.map((detail) => (
                  <div key={detail.label} className="text-gray-700">
                    <span className="font-semibold">{detail.label}:</span> {getTextValue(detail.value)}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
              <div className="flex gap-4 flex-wrap">
                {images.bannerUrl ? (
                  <img
                    src={images.bannerUrl}
                    className="rounded-lg shadow-md"
                    width="150"
                    height="150"
                    loading="lazy"
                    alt={`${character.nameEN} banner`}
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                ) : null}

                {images.racewearUrl ? (
                  <img
                    src={images.racewearUrl}
                    className="rounded-lg shadow-md"
                    width="150"
                    height="150"
                    loading="lazy"
                    alt={`${character.nameEN} racewear`}
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                ) : null}

                {!images.bannerUrl && !images.racewearUrl ? (
                  <div className="rounded-lg shadow-md bg-gray-100 text-gray-500 px-4 py-6">
                    Gallery images unavailable
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CharactersInfo