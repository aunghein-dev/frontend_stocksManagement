"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, memo, useState } from "react"; // useState needs to be imported
import navbarData from "@/data/navbar.data";
import { useInfo } from "@/hooks/useInfo";
import { // Ensure all icons are imported if used
  HiHome,
  HiViewGrid,
  HiCurrencyDollar,
  HiTrendingUp,
  HiDocumentText,
  HiCog,
  HiShieldCheck,
} from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";

const iconMap = {
  Home: HiHome,
  Dashboard: HiViewGrid,
  Sales: HiCurrencyDollar,
  Stocks: HiTrendingUp,
  Report: HiDocumentText,
  Settings: HiCog,
  "Privay Policy": HiShieldCheck,
};

function SidebarComponent(props : { sidebarOpen: boolean , setSidebarOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const { business, isLoading, error, refresh } = useInfo();
  const [imgLoaded, setImgLoaded] = useState(false); // Make sure useState is imported

  const activeRouteMap = useMemo(() => {
    return navbarData.map((item) => {
      const isActive =
        item.path === "/"
          ? pathname === "/"
          : pathname === item.path || pathname.startsWith(`${item.path}/`);
      return {
        ...item,
        isActive,
        Icon: iconMap[item.title as keyof typeof iconMap],
      };
    });
  }, [pathname]);


  return (
    <aside
        className={`
          fixed top-0 left-0 w-[200px] sm:w-[200px] bg-white shadow-lg border-r-[0.5px] border-gray-200
          flex flex-col justify-between rounded-r-sm
          transition-opacity duration-100 ease-in-out
          ${props.sidebarOpen ? "opacity-100 pointer-events-auto z-55" : "opacity-0 pointer-events-none z-0"}
          sm:opacity-100 sm:pointer-events-auto sm:z-55 h-full
        `}
      >
     <button className="absolute top-2 right-2  text-gray-300 hover:text-gray-400 text-md   
                        cursor-pointer p-1.5 transition-colors duration-200 ease-in-out
                        sm:hidden" 
             onClick={() => props.setSidebarOpen(false)}><AiOutlineClose /></button>
     <div className="p-6 flex items-center min-h-[110px] justify-center">
      {isLoading ? ( // Use isLoading for initial loading state
        <div className="flex items-center justify-between  w-full">
           <div className="w-12 h-12 bg-gray-400 rounded-full animate-pulse" />
           <div className="w-22 h-5 bg-gray-400 rounded-sm animate-pulse relative">
            <div className="absolute top-7 right-0 h-4.5 w-12 bg-gray-400 rounded-sm animate-pulse"></div>
           </div>
        </div>
      ) : ( // Once not loading, display content
        <div className="flex items-center w-full relative">
          {/* Always render the div for the logo, let the Image src handle the fallback */}
          <div
            className={`w-12 h-12 flex items-center justify-center mr-0 rounded-sm overflow-hidden flex-shrink-0 transition-opacity duration-300 ease-in-out 
             ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ willChange: "opacity" }}
          >
            <div className="relative w-12 h-12">
                <Image
                  src={business?.businessId===1 ? 
                       business?.businessLogo || "/Box.png": "/applogo.png" }
                  alt="Openware Logo" 
                  fill
                  sizes="(max-width: 640px) 50px, 50px"
                  className="object-contain"
                  priority
                  onLoad={() => setImgLoaded(true)}
                  onError={(e) => { // Handle image loading errors as well
                    setImgLoaded(true); // Still set to true to show the placeholder/text
                    console.error("Image failed to load:", e.currentTarget.src);
                    // You might want to set src to "/Box.png" here if it failed for a valid URL
                    e.currentTarget.src = "/Box.png"; // Fallback on error
                  }}
                />
            </div>
          </div>
          {/* Always render the h1, use fallback for empty string */}
          <h1
            className={`text-xl font-bold
                        bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent
                        cursor-default
                        transition-opacity duration-300 ease-in-out ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ willChange: "opacity" }}
          >
            {business?.businessId === 1 ? business?.businessNameShortForm : "Openware"}
          </h1>
          <div className={`absolute top-10 right-2 px-1 py-0.5 bg-blue-100
                        text-blue-700 border-[0.5px] border-blue-500 rounded-xs text-[0.55rem]
                        cursor-default ${
              imgLoaded ? "opacity-100" : "opacity-0"}`}
               style={{ willChange: "opacity" }}>Free v0.1</div>
        </div>  
      )}
    </div>


      <nav className="flex-grow px-4 overflow-y-auto">
        <ul className="space-y-2">
          {activeRouteMap.map(({ id, path, title, isActive, Icon }) => (
            <li key={id}>
              <Link
                href={path}
                // Update Link component as per Next.js 13+ recommendations
                // No need for `passHref` or `legacyBehavior` with modern Next.js Link
                className={`group relative flex items-center w-full px-3 py-2 rounded-sm transition-all duration-200 text-sm font-medium ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <span
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r transition-transform duration-300 ${
                    isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                  }`}
                />
                {Icon && (
                  <Icon
                    className={`w-5 h-5 mr-3 flex-shrink-0 ${
                      isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-500"
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span className="ml-1 z-10">{title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="px-4 py-6 text-center text-xs border-t border-gray-100 text-gray-500">
        <p className="font-semibold text-gray-700">
          Developed by <span className="text-blue-500 font-bold">Aung Hein</span>
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          © {new Date().getFullYear()} All rights reserved.
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          <a href="mailto:aunghein.mm@hotmail.com" className="text-blue-500 hover:underline">
            aunghein.mm@hotmail.com
          </a>
        </p>
      </footer>
    </aside>
  );
}

const Sidebar = memo(SidebarComponent);
export default Sidebar;