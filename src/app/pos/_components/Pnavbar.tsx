import AppLogo from "./_atoms/AppLogo";
import DesktopMenu from "./_atoms/DesktopMenu";
import HamburgerSec from "./_atoms/HamburgerSec";
import MobileMenu from "./_atoms/MobileMenu";

interface PnavbarProps {
  handleLinkClick: () => void;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Pnavbar(props : PnavbarProps) {

  const { handleLinkClick, menuOpen, setMenuOpen } = props;

  return (
   <nav className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-20">
          {/* Left: Brand */}
        <AppLogo/>

        <div className="flex items-center">
          {/* Right: Links (desktop only) */}
          <DesktopMenu/>

          {/* Right: CTA + Hamburger */}
          <HamburgerSec menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          </div>
        </div>

        {/* Mobile menu */}
        <MobileMenu handleLinkClick={handleLinkClick} menuOpen={menuOpen} />
      </nav>
  );
}
