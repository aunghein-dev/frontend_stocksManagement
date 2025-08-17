import Link from "next/link";

export default function GetStartedBtn(){
  return (
    <Link 
        href={"/signup"}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                 hover:bg-blue-700 transition hidden md:block">
        Get Started
    </Link>
  )
}