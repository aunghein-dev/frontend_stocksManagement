import Link from "next/link";
import SectionLinksData from "../_data/sections.data";

interface MobileMenuProps {
  handleLinkClick: () => void;
  menuOpen: boolean;
}

export default function MobileMenu({ handleLinkClick, menuOpen }: MobileMenuProps) {
  return (
    <div
      className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden px-4 ${
        menuOpen ? "max-h-[500px] opacity-100 mt-3 pb-5" : "max-h-0 opacity-0"
      }`}
      id="navbar-menu"
    >
      {/* Section links */}
      {SectionLinksData.map((section) => (
        <a
          key={section.href}
          href={`#${section.href}`}
          onClick={handleLinkClick}
          className="block py-2 px-3 text-gray-700 hover:text-blue-600 font-medium"
        >
          {section.name}
        </a>
      ))}

      {/* Join button */}
      <Link
        href={"/signup"}
        onClick={handleLinkClick}
        className="block mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mt-5 text-center"
      >
        Get Started
      </Link>
    </div>
  );
}
