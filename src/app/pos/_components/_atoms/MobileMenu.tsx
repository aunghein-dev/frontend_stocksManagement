import SectionLinksData from "../_data/sections.data";

interface MobileMenuProps {
  handleLinkClick: () => void;
  menuOpen: boolean;
}

export default function MobileMenu({ handleLinkClick, menuOpen }: MobileMenuProps) {
  return (
    <div
      className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden px-4 ${
        menuOpen ? "max-h-[200px] opacity-100 mt-3 pb-5" : "max-h-0 opacity-0"
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

    </div>
  );
}
