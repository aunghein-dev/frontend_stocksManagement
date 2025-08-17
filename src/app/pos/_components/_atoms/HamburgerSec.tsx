import GetStartedBtn from "../_particles/GetStartedBtn";

interface HamburgerSecProps {
  menuOpen: boolean
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function HamburgerSec(props : HamburgerSecProps) {

  const { menuOpen, setMenuOpen } = props;

  return (
     <div className="flex items-center space-x-4">
      <GetStartedBtn/>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
        aria-controls="navbar-menu"
        aria-expanded={menuOpen}
      >
        <span className="sr-only">Open menu</span>
        {menuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  )
}