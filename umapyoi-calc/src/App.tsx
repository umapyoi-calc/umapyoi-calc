import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import CharactersCard from './routes/CharactersCard'
import CharactersInfo from './routes/CharactersInfo'
import Home from './routes/Home'
import InheritanceCalPage from './routes/InheritanceCalPage'
import SupportCards from './routes/SupportCards'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/characters" element={<CharactersCard />} />
          <Route path="/character" element={<CharactersInfo />} />
          <Route path="/inheritance" element={<InheritanceCalPage />} />
          <Route path="/support" element={<SupportCards />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
