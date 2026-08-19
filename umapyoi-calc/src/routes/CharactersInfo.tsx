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
        setStatus('Carga Exitosa')

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
    <div className="min-h-screen bg-black w-full p-4 md:p-8 pt-28">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/characters')}
          className="mt-12 mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          type="button"
        >
          Back to characters
        </button>

        {/*<p className="text-sm text-gray-600 mb-4">{status}</p>         (Lo borré porque no aporta mucho, y le hace clutter a la UI)*/}

        {!character ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">No character data available</h1>
            <p className="mt-3 text-gray-600">ID: {umaId}</p>
            <p className="mt-2 text-gray-500">
              If this is a new character, seed Firestore again or add the document manually.
            </p>
          </div>
        ) : (





          

<div className="max-w-5xl mx-auto relative flex flex-col gap-6 p-4">

      <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[900px] bg-[#1393fb] rounded-full blur-[260px] opacity-20"></div>
      <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[900px] bg-[#e316c8] rounded-full blur-[260px] opacity-15"></div>


  <div className="flex flex-col md:flex-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
    
       {/* TODO: Hacer que la galeria sea funcional */}   

    {/* Columna Izquierda: Imagen Principal y Galería */}
    <div className="md:w-1/3 bg-white/5 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
      {images.mainUrl ? (
        <img
          src={images.mainUrl}
          className="w-full max-w-[240px] object-cover rounded-2xl shadow-2xl border border-white/10"
          alt={character.nameEN || 'Uma Character'}
        />
      ) : (
        <div className="w-full max-w-[240px] aspect-[3/4] rounded-2xl shadow-inner bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center text-gray-500 font-medium">
          No Image Available
        </div>
      )}
      
      {/* Galería (Miniaturas) */}
      <div className="mt-6 w-full">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Gallery</h3>
        <div className="flex justify-center gap-3">
          {images.bannerUrl && (
            <img src={images.bannerUrl} className="w-16 h-16 rounded-xl shadow-lg border border-white/20 object-cover" loading="lazy" alt="Banner" style={{ imageRendering: 'crisp-edges' }} />
          )}
          {images.racewearUrl && (
            <img src={images.racewearUrl} className="w-16 h-16 rounded-xl shadow-lg border border-white/20 object-cover" loading="lazy" alt="Racewear" style={{ imageRendering: 'crisp-edges' }} />
          )}
          {!images.bannerUrl && !images.racewearUrl && (
             <span className="text-xs text-gray-500 italic">No gallery images</span>
          )}
        </div>
      </div>
    </div>

    <div className="md:w-2/3 p-6 md:p-8 flex flex-col relative">
      
      <div className="flex flex-col items-center justify-center gap-4 mb-6 text-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {getTextValue(character.nameEN)}
          </h1>
          <h2 className="text-lg font-medium text-gray-400 mt-1">
            {getTextValue(character.nameJP)}
          </h2>
        </div>
        <span className="bg-white/10 border border-white/20 text-gray-200 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
          ID: {getTextValue(character.id)}
        </span>
      </div>




      <div className="mb-8">
        <p className="text-white font-bold mb-2 text-lg">
          {getTextValue(character.details?.intro)}
        </p>
        <p className="text-gray-300 leading-relaxed text-sm font-medium">
          {getTextValue(character.details?.description)}
        </p>
      </div>





      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">



        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Core Stats
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Speed', val: character.stats?.speed },
              { label: 'Stamina', val: character.stats?.stamina },
              { label: 'Power', val: character.stats?.power },
              { label: 'Guts', val: character.stats?.guts },
              { label: 'Wit', val: character.stats?.wit },
            ].map(stat => (
            <div key={stat.label} className="flex justify-between items-center border-b border-white/10 pb-1 last:border-0 last:pb-0">
                <span className="text-gray-300 font-medium">{stat.label}</span>
                <span className="font-bold text-white">{getTextValue(stat.val)}</span>
            </div>
            ))}
          </div>
        </div>





        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Growth Rate
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Speed', val: character.growthRate?.speed },
              { label: 'Stamina', val: character.growthRate?.stamina },
              { label: 'Power', val: character.growthRate?.power },
              { label: 'Guts', val: character.growthRate?.guts },
              { label: 'Wit', val: character.growthRate?.wit },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center border-b border-white/10 pb-1 last:border-0 last:pb-0">
                <span className="text-gray-300 font-medium">{stat.label}</span>
                <span className="font-bold text-pink-400 drop-shadow-sm">{getTextValue(stat.val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>





      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
          Aptitudes
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs font-bold text-gray-500 mb-2">TRACK</span>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-md font-bold">Turf: {getTextValue(character.track?.turf)}</span>
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-md font-bold">Dirt: {getTextValue(character.track?.dirt)}</span>
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 mb-2">DISTANCE</span>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md font-bold">Sprint : {getTextValue(character.distance?.sprint)}</span>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md font-bold">Mile   : {getTextValue(character.distance?.mile)}</span>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md font-bold">Medium : {getTextValue(character.distance?.medium)}</span>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md font-bold">Long   : {getTextValue(character.distance?.long)}</span>
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 mb-2">RUNNING STYLE</span>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-md font-bold">Front: {getTextValue(character.style?.front)}</span>
              <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-md font-bold">Pace : {getTextValue(character.style?.pace)}</span>
              <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-md font-bold">Late : {getTextValue(character.style?.late)}</span>
              <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-md font-bold">End  : {getTextValue(character.style?.end)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>





  {/* (Personal Details) */}
  <details className="group bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl [&_summary::-webkit-details-marker]:hidden overflow-hidden transition-all duration-300">
    <summary className="flex items-center justify-between cursor-pointer list-none select-none p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-pink-500/20 p-2 rounded-lg border border-pink-500/30">
          <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Personal Details
        </h2>
      </div>
      <span className="transition-transform duration-300 group-open:-rotate-180 text-pink-400 bg-white/10 rounded-full p-1 border border-white/20 shadow-sm">
        <svg fill="none" height="24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </summary>
    
    <div className="px-6 pb-6 pt-2 border-t border-white/10 mt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 text-sm mt-4">
        {detailRows.map((detail) => (
          <div key={detail.label} className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{detail.label}</span>
            <span className="text-white font-semibold">{getTextValue(detail.value)}</span>
          </div>
        ))}
      </div>
    </div>
  </details>

</div>






        )}
      </div>
    </div>
  )
}

export default CharactersInfo