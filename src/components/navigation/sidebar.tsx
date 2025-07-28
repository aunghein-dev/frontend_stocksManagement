// src/components/SidebarComponent.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, memo, useState, useEffect } from "react";
import navbarData, { NavbarItem } from "@/data/navbar.data"; // Import NavbarItem type
import { useInfo } from "@/hooks/useInfo";
import { useTranslation } from "@/hooks/useTranslation";
import {
  HiHome,
  HiChartPie,
  HiDocumentText,
  HiCog,
  HiShieldCheck,
  HiChevronDown, // Icon for dropdown arrow
  HiDatabase, // Icon for Inventory group
  HiUsers, // Icon for Suppliers (if using 'suppliers' key)
  HiUserGroup, // Icon for Customers (if using 'customers' key)
  HiCube,
  HiTruck,
  HiCurrencyDollar,
  HiChartBar
} from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { IconType } from "react-icons";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Ensure keys here match the 'key' property in navbar.data.ts
const iconMap: { [key: string]: IconType } = {
  home: HiHome,
  dashboard: HiChartPie,
  salesTransactions: HiCurrencyDollar,
  inventory: HiDatabase,
  stocks: HiCube,
  suppliers: HiUsers, // Ensure this matches the key in navbar.data.ts
  customers: HiUserGroup, // Ensure this matches the key in navbar.data.ts
  salesReports: HiDocumentText,
  settings: HiCog,
  privacyPolicy: HiShieldCheck,
  sales: HiChartBar,
  procurement: HiTruck
};

// Define an enriched NavbarItem type for use within the component
// Omit 'children' from the base NavbarItem and redefine it with the enriched type
interface EnrichedNavbarItem extends Omit<NavbarItem, 'children'> {
  title: string; // The translated title
  isActive: boolean; // Whether the item or its children are active
  Icon?: IconType; // The React Icon component
  children?: EnrichedNavbarItem[]; // Recursive definition for children
}

function SidebarComponent(props: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { business, isLoading } = useInfo();
  const [imgLoaded, setImgLoaded] = useState(false);
  const { t } = useTranslation();

  // State to manage the expansion of group items. Using a key-value map.
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  // Effect to automatically open a group if any of its children are the active route
  useEffect(() => {
    const newOpenGroups: { [key: string]: boolean } = {};
    navbarData.forEach((item) => {
      if (item.isGroup && item.children) {
        // Check if any direct child's path matches the current pathname
        const isAnyChildDirectlyActive = item.children.some(
          (child) => child.path && pathname === child.path
        );

        // Check if any child's path is a prefix of the current pathname (for nested routes)
        const isAnyChildPrefixActive = item.children.some(
          (child) => child.path && pathname.startsWith(`${child.path}/`)
        );

        if (isAnyChildDirectlyActive || isAnyChildPrefixActive) {
          newOpenGroups[item.key] = true;
        }
      }
    });
    // Merge new active groups with existing state, prioritizing the auto-open
    setOpenGroups((prev) => ({ ...prev, ...newOpenGroups }));
  }, [pathname]); // Re-run when pathname changes

  // Function to toggle group state
  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key], // Toggle the specific group's state
    }));
  };

  const activeRouteMap: EnrichedNavbarItem[] = useMemo(() => {
    // Recursive function to map and enrich each NavbarItem
    const mapItem = (item: NavbarItem): EnrichedNavbarItem => {
      const translatedTitle = t(item.key);
      const iconComponent = iconMap[item.key];
      let itemIsActive = false; // Internal variable for clarity

      if (item.isGroup && item.children) {
        // This is a group item
        // Recursively map children first to get their enriched state
        const enrichedChildren = item.children.map(mapItem);

        // A group is active if any of its enriched children are active
        itemIsActive = enrichedChildren.some((child) => child.isActive);

        return {
          id: item.id,
          key: item.key,
          path: item.path, // Will be undefined for groups from navbarData
          isGroup: item.isGroup,
          title: translatedTitle,
          isActive: itemIsActive, // Assign the calculated active state for the group
          Icon: iconComponent,
          children: enrichedChildren, // Correctly typed as EnrichedNavbarItem[]
        };
      } else {
        // This is a regular navigation item (not a group)
        if (item.path) {
          // Check for exact match or prefix match for active state
          itemIsActive = item.path === "/"
            ? pathname === "/"
            : pathname === item.path || pathname.startsWith(`${item.path}/`);
        }

        return {
          id: item.id,
          key: item.key,
          path: item.path,
          // `isGroup` and `children` will be undefined/false for non-group items, which is fine
          title: translatedTitle,
          isActive: itemIsActive, // Assign the calculated active state for the individual item
          Icon: iconComponent,
        };
      }
    };

    return navbarData.map(mapItem);
  }, [pathname, t]); // `t` is a dependency to ensure re-calculation if locale changes

  // Recursive rendering function for navigation items
  const renderNavItem = (item: EnrichedNavbarItem, level: number = 0) => {
    const indentClass = level > 0 ? "ml-6" : ""; // Indent for sub-items
   // const childClassStyle = level === 0 ? "text-sm" : "text-xs";
    if (item.isGroup && item.children) {
      const isOpen = openGroups[item.key] || false; // Get current open state for this group
      return (
        <li key={item.id}>
          <button
            className={`group relative flex items-center justify-between w-full px-3 py-2 rounded-xs transition-all duration-200 text-sm font-medium 
                        ${
                          item.isActive // Use item.isActive for styling this button
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-blue-50"
                        }`}
            onClick={() => toggleGroup(item.key)} // Toggle this specific group
          >
            {/* Blue active bar */}
            <span
              className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r transition-transform duration-300  ${
                item.isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
              }`}
            />
            {item.Icon && (
              <item.Icon
                className={`w-5 h-5 mr-3 flex-shrink-0 ${
                  item.isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-600"
                }`}
                aria-hidden="true"
              />
            )}
            <span className="flex-grow ml-1 text-left z-10 ">{item.title}</span>
            <HiChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpen && (
            <ul className="mt-2 space-y-2 ">
              {item.children.map((child) => renderNavItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    } else {
      // Regular navigation item (not a group)


      return (
        <li key={item.id}>
          <Link
            // Ensure href is always a string. Fallback to '#' if path is undefined (shouldn't happen for non-group items)
            href={item.path || "#"}
            className={`group relative flex items-center px-3 py-2 rounded-xs transition-all duration-200 text-sm font-medium ${indentClass} 
                        ${
                          item.isActive  // Use item.isActive for styling this link
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-blue-50"
                        }`}
            onClick={() => props.setSidebarOpen(false)} // Close sidebar on link click (for mobile)
          >
            {/* Blue active bar */}
            <span
              className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r transition-transform duration-300 ${
                item.isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
              }`}
            />
            {item.Icon && (
              <item.Icon
                className={`w-5 h-5 mr-3 flex-shrink-0 ${
                  item.isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-600"
                }`}
                aria-hidden="true"
              />
            )}
            <span className={`flex-grow ml-1 text-left z-10`}>{item.title}</span>
          </Link>
        </li>
      );
    }
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 w-[200px] sm:w-[200px] bg-white shadow-lg border-r-[0.5px] border-gray-200
        flex flex-col justify-between rounded-r-lg
        transition-opacity duration-100 ease-in-out 
        ${
          props.sidebarOpen
            ? "opacity-100 pointer-events-auto z-55"
            : "opacity-0 pointer-events-none z-0"
        }
        sm:opacity-100 sm:pointer-events-auto sm:z-55 h-full
      `}
    >
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-900 text-md
                   cursor-pointer p-1.5 transition-colors
                   sm:hidden hover:bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center ease-in-out duration-300"
        onClick={() => props.setSidebarOpen(false)}
      >
        <AiOutlineClose />
      </button>
      <div className="p-6 flex items-center min-h-[110px] justify-center ">
        {isLoading ? (
          <div className="flex items-center justify-between w-full">
            <div className="w-12 h-12 bg-gray-400 rounded-full animate-pulse" />
            <div className="w-22 h-5 bg-gray-400 rounded-xs animate-pulse relative">
              <div className="absolute top-7 right-0 h-4.5 w-12 bg-gray-400 rounded-xs animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center w-full relative">
            <div
              className={`w-12 h-12 flex items-center justify-center mr-0 rounded-xs overflow-hidden flex-shrink-0 transition-opacity duration-300 ease-in-out
             ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              style={{ willChange: "opacity" }}
            >
              <div className="relative w-12 h-12">
                <Image
                  src={
                    business?.businessId === 1
                      ? business?.businessLogo || "/Box.png"
                      : "/onlylogo.png"
                  }
                  alt="Openware Logo"
                  fill
                  sizes="(max-width: 640px) 50px, 50px"
                  className="object-contain"
                  priority
                  onLoad={() => setImgLoaded(true)}
                  onError={(e) => {
                    setImgLoaded(true);
                    console.error("Image failed to load:", e.currentTarget.src);
                    e.currentTarget.src = "/Box.png";
                  }}
                />
              </div>
            </div>
            <h1
              className={`text-xl font-bold
                        bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent
                        cursor-default
                        transition-opacity duration-300 ease-in-out ${
                          imgLoaded ? "opacity-100" : "opacity-0"
                        }`}
              style={{ willChange: "opacity" }}
            >
              {business?.businessId === 1 ? business?.businessNameShortForm : "Openware"}
            </h1>
            <div
              className={`absolute top-10 right-2 px-1 py-0.5 bg-blue-100
                        text-blue-700 border-[0.5px] border-blue-600 rounded-xs text-[0.55rem]
                        cursor-default ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              style={{ willChange: "opacity" }}
            >
              version 0.2.1
            </div>
          </div>
        )}
      </div>


      <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {activeRouteMap.map((item) =>
            // Render each top-level item using the recursive renderNavItem function
            renderNavItem(item)
          )}
        </ul>
      </nav>

      <div className="flex items-center justify-left px-4.5 mb-2 md:hidden">
        <LanguageSwitcher />
      </div>
      <footer className="px-4 py-6 text-center text-xs border-t border-gray-100 text-gray-500">
        <a
          className="font-semibold text-gray-700"
          href="https://openwaremyanmar.com"
          target="_blank"
        >
          {t("lbl_dvlpBy")}{" "}
          <span className="text-blue-600 font-bold">Openware</span>
        </a>
        <p className="mt-1 text-[11px] text-gray-400">
          © {new Date().getFullYear()} {t("allRightsReserved")}
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          <a href="mailto:aunghein.mm@hotmail.com" className="text-blue-600 hover:underline">
            openwaremyanmar@gmail.com
          </a>
        </p>
      </footer>
    </aside>
  );
}

const Sidebar = memo(SidebarComponent);
export default Sidebar;