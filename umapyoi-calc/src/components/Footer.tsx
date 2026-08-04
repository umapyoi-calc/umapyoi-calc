import { FiMessageSquare } from 'react-icons/fi'
import { IoMapOutline } from 'react-icons/io5'
import { LuBadgeInfo } from 'react-icons/lu'
import { MdOutlinePrivacyTip } from 'react-icons/md'

const Footer = () => {
  return (
    <footer className="relative w-full mt-auto bg-black pt-10 overflow-hidden border-t border-white/30">
      <div className="bg-transparent flex flex-col items-center justify-center gap-6 py-10 relative z-10 w-full">
        <div className="flex flex-row items-center justify-center gap-8 md:gap-12 text-sm font-medium text-white -mt-10">
          <button className="flex items-center gap-2 cursor-pointer" type="button">
            <LuBadgeInfo className="text-xl" />
            <span className="hidden sm:inline">About Us</span>
          </button>

          <button className="flex items-center gap-2 cursor-pointer" type="button">
            <IoMapOutline className="text-xl" />
            <span className="hidden sm:inline">Guides</span>
          </button>

          <button className="flex items-center gap-2 cursor-pointer" type="button">
            <FiMessageSquare className="text-xl" />
            <span className="hidden sm:inline">Contact</span>
          </button>

          <button className="flex items-center gap-2 cursor-pointer" type="button">
            <MdOutlinePrivacyTip className="text-xl" />
            <span className="hidden sm:inline">Privacy Policy</span>
          </button>
        </div>

        <p className="text-xs text-gray-100 mt-2 text-center px-4">
          Copyright {new Date().getFullYear()} UmapyoiDB - Unofficial fan site for Umamusume: Pretty Derby - Built for the Umamusume community.
        </p>

        <p className="text-xs text-gray-100 text-center px-4">
          Umamusume: Pretty Derby is Copyright Cygames, Inc. This site is not affiliated with or endorsed by Cygames.
        </p>
      </div>
    </footer>
  )
}

export default Footer