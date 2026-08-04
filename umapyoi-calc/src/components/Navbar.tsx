import { FaHandsHelping } from 'react-icons/fa'
import { GiFamilyTree } from 'react-icons/gi'
import { LuDatabase } from 'react-icons/lu'
import { Link, NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `py-1 px-3 text-xs md:text-base lg:text-xl font-semibold rounded-2xl whitespace-nowrap transition duration-300 flex items-center gap-2 ${
    isActive
      ? 'bg-slate-700 text-white'
      : 'text-gray-300 hover:text-white hover:bg-slate-700'
  }`

const Navbar = () => {
  return (
    <nav className="bg-black border-b border-white/30 shadow-lg flex items-center justify-between py-3 px-4 md:px-8 lg:px-16 fixed top-0 left-0 w-full z-50 gap-2">
      <Link to="/">
        <span className="text-lg md:text-3xl lg:text-4xl font-semibold text-gray-300 hover:text-white rounded-2xl whitespace-nowrap">
          Umapyoi Calculator
        </span>
      </Link>

      <div className="flex items-center gap-2 lg:gap-5 overflow-x-auto">
        <NavLink to="/characters" className={navLinkClass}>
          <LuDatabase /> Umas Database
        </NavLink>

        <NavLink to="/inheritance" className={navLinkClass}>
          <GiFamilyTree /> Inheritance Calculator
        </NavLink>

        <NavLink to="/support" className={navLinkClass}>
          <FaHandsHelping /> Support Cards
        </NavLink>
      </div>
    </nav>
  )
}

export default Navbar