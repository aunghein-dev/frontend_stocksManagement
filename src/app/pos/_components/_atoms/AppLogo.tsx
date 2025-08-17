import Image from "next/image"
export default function AppLogo(){
  return (
    <a href="#home" className="flex items-center space-x-1">
      <Image
        src="/onlylogo.png"
        alt="Openware"
        width={40}
        height={40}
        unoptimized
      />
      <span className="self-center whitespace-nowrap text-2xl font-semibold text-gray-900">
        OPENWARE.
      </span>
    </a>
  )
}