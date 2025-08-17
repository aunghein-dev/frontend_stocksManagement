import SectionLinksData from "../_data/sections.data"

export default function DesktopMenu(){
  return (
    <div className="hidden md:flex md:space-x-6 mr-5">
      {SectionLinksData.map((section) => (
        <a
          key={section.href}
          href={`#${section.href}`}
          className="block py-2 px-3 text-gray-700 hover:text-blue-600 font-medium"
        >
          {section.name}
        </a>
      ))}
    </div>
  )
}