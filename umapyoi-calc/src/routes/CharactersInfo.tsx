import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCharacterById, type CharacterDocument } from '../services/characters'
import { getStorageFileUrl } from '../services/storage'
import speedIcon from '../assets/speed.webp';
import staminaIcon from '../assets/stamina.webp';
import powerIcon from '../assets/power.webp';
import gutsIcon from '../assets/guts.webp';
import witIcon from '../assets/wit.webp';

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


const getAptClass = (val: string | number | undefined, color: 'green' | 'amber' | 'blue' | 'purple', isHighlighting: boolean) => {
  const isA = String(val).toUpperCase() === 'A';
  
  const colorMap = {
    green: {
      normal: 'bg-green-500/10 text-green-400 border-green-500/20 font-bold',
      active: 'bg-green-500/20 text-green-300 border-green-500/50 font-bold',
      inactive: 'bg-green-500/5 text-green-500/50 border-green-500/10 font-medium'
    },
    amber: {
      normal: 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold',
      active: 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold',
      inactive: 'bg-amber-500/5 text-amber-500/50 border-amber-500/10 font-medium'
    },
    blue: {
      normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold',
      active: 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold',
      inactive: 'bg-blue-500/5 text-blue-500/50 border-blue-500/10 font-medium'
    },
    purple: {
      normal: 'bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold',
      active: 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold',
      inactive: 'bg-purple-500/5 text-purple-500/50 border-purple-500/10 font-medium'
    }
  };

  const base = "text-xs px-2.5 py-1 rounded-md transition-all duration-300 border flex-1 text-center min-w-[70px]";
  
  if (!isHighlighting) return `${base} ${colorMap[color].normal}`;
  return `${base} ${isA ? colorMap[color].active : colorMap[color].inactive}`;
};




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
  const [activeImage, setActiveImage] = useState<string>('');
  const [highlightBest, setHighlightBest] = useState<boolean>(false);

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
    setActiveImage(mainUrl) 
        
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
  className="mt-12 mb-4 group flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
  type="button"
>
  <svg 
    className="w-4 h-4 text-pink-400 transition-transform duration-300 group-hover:-translate-x-1" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth="2.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
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
   

    {/* Columna Izquierda: Imagen Principal y Galería */}
    <div className="md:w-1/3 bg-white/5 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
      {activeImage ? ( // <--- CAMBIADO
      <img
        src={activeImage} // <--- CAMBIADO
        className="w-full max-w-[240px] object-cover rounded-2xl shadow-2xl border border-white/10 transition-all duration-300"
        alt={character.nameEN || 'Uma Character'}
        />
      )  : (
        <div className="w-full max-w-[240px] aspect-[3/4] rounded-2xl shadow-inner bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center text-gray-500 font-medium">
          No Image Available
        </div>
      )}
      
      {/* Galería (Miniaturas) */}
      <div className="mt-6 w-full">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Gallery</h3>
        <div className="flex justify-center gap-3">
  {images.mainUrl && (
    <img 
      src={images.mainUrl} 
      onClick={() => setActiveImage(images.mainUrl)}
      className={`w-16 h-16 rounded-xl shadow-lg border-2 object-cover cursor-pointer transition-transform duration-200 hover:scale-105 ${activeImage === images.mainUrl ? 'border-pink-400' : 'border-white/20'}`} 
      loading="lazy" alt="Main" style={{ imageRendering: 'crisp-edges' }} 
    />
  )}
  {images.bannerUrl && (
    <img 
      src={images.bannerUrl} 
      onClick={() => setActiveImage(images.bannerUrl)}
      className={`w-16 h-16 rounded-xl shadow-lg border-2 object-cover cursor-pointer transition-transform duration-200 hover:scale-105 ${activeImage === images.bannerUrl ? 'border-pink-400' : 'border-white/20'}`} 
      loading="lazy" alt="Banner" style={{ imageRendering: 'crisp-edges' }} 
    />
  )}
  {images.racewearUrl && (
    <img 
      src={images.racewearUrl} 
      onClick={() => setActiveImage(images.racewearUrl)}
      className={`w-16 h-16 rounded-xl shadow-lg border-2 object-cover cursor-pointer transition-transform duration-200 hover:scale-105 ${activeImage === images.racewearUrl ? 'border-pink-400' : 'border-white/20'}`} 
      loading="lazy" alt="Racewear" style={{ imageRendering: 'crisp-edges' }} 
    />
  )}
  {!images.mainUrl && !images.bannerUrl && !images.racewearUrl && (
    <span className="text-xs text-gray-500 italic">No gallery images</span>
  )}
</div>
      </div>
    </div>

    <div className="md:w-2/3 p-6 md:p-8 flex flex-col relative">
      
<div className="relative flex flex-col items-center justify-center mb-6 text-center w-full py-4">
  <div>

    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
      {getTextValue(character.nameEN)}
    </h1>
    <h2 className="text-lg font-medium text-gray-400 mt-2">
      {getTextValue(character.nameJP)}
    </h2>
  </div>


  <span className="absolute top-0 right-0 bg-white/10 border border-white/20 text-gray-200 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
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
            { label: 'Speed', val: character.stats?.speed, icon: speedIcon },
            { label: 'Stamina', val: character.stats?.stamina, icon: staminaIcon },
            { label: 'Power', val: character.stats?.power, icon: powerIcon },
            { label: 'Guts', val: character.stats?.guts, icon: gutsIcon },
            { label: 'Wit', val: character.stats?.wit, icon: witIcon },
          ].map(stat => (
            <div key={stat.label} className="flex justify-between items-center border-b border-white/10 pb-1 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <img src={stat.icon} alt={stat.label} className="w-5 h-5 object-contain" />
                <span className="text-gray-300 font-medium">{stat.label}</span>
              </div>
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
            { label: 'Speed', val: character.growthRate?.speed, icon: speedIcon },
            { label: 'Stamina', val: character.growthRate?.stamina, icon: staminaIcon },
            { label: 'Power', val: character.growthRate?.power, icon: powerIcon },
            { label: 'Guts', val: character.growthRate?.guts, icon: gutsIcon },
            { label: 'Wit', val: character.growthRate?.wit, icon: witIcon },
          ].map(stat => (
            <div key={stat.label} className="flex justify-between items-center border-b border-white/10 pb-1 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <img src={stat.icon} alt={stat.label} className="w-5 h-5 object-contain" />
                <span className="text-gray-300 font-medium">{stat.label}</span>
              </div>
              <span className="font-bold text-pink-400 drop-shadow-sm">{getTextValue(stat.val)}</span>
            </div>
          ))}
        </div>
      </div>
      </div>





      <div>
     <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
      Aptitudes
     </h3>
      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
        <input
         type="checkbox"
          className="w-3.5 h-3.5 rounded border-gray-600 bg-black/50 text-pink-500 focus:ring-pink-500 focus:ring-offset-gray-900 cursor-pointer"
         checked={highlightBest}
         onChange={(e) => setHighlightBest(e.target.checked)}
       />
       Highlight Best (A)
      </label>
     </div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div>
      <span className="block text-xs font-bold text-gray-500 mb-2">TRACK</span>
      <div className="flex gap-2 flex-wrap">
        <span className={getAptClass(character.track?.turf, 'green', highlightBest)}>Turf: {getTextValue(character.track?.turf)}</span>
        <span className={getAptClass(character.track?.dirt, 'amber', highlightBest)}>Dirt: {getTextValue(character.track?.dirt)}</span>
      </div>
    </div>
    <div>
      <span className="block text-xs font-bold text-gray-500 mb-2">DISTANCE</span>
      <div className="flex gap-2 flex-wrap">
        <span className={getAptClass(character.distance?.sprint, 'blue', highlightBest)}>Sprint: {getTextValue(character.distance?.sprint)}</span>
        <span className={getAptClass(character.distance?.mile, 'blue', highlightBest)}>Mile: {getTextValue(character.distance?.mile)}</span>
        <span className={getAptClass(character.distance?.medium, 'blue', highlightBest)}>Med: {getTextValue(character.distance?.medium)}</span>
        <span className={getAptClass(character.distance?.long, 'blue', highlightBest)}>Long: {getTextValue(character.distance?.long)}</span>
      </div>
    </div>
    <div>
      <span className="block text-xs font-bold text-gray-500 mb-2">RUNNING STYLE</span>
      <div className="flex gap-2 flex-wrap">
        <span className={getAptClass(character.style?.front, 'purple', highlightBest)}>Front: {getTextValue(character.style?.front)}</span>
        <span className={getAptClass(character.style?.pace, 'purple', highlightBest)}>Pace: {getTextValue(character.style?.pace)}</span>
        <span className={getAptClass(character.style?.late, 'purple', highlightBest)}>Late: {getTextValue(character.style?.late)}</span>
        <span className={getAptClass(character.style?.end, 'purple', highlightBest)}>End: {getTextValue(character.style?.end)}</span>
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