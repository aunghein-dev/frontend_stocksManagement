// components/Navbar.tsx
"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { IoCartOutline } from "react-icons/io5";
import { useCartStore } from "@/lib/stores/useCartStore";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiMenu } from 'react-icons/fi'; // FiX is not used, can remove - REMOVED
import { useUser } from "@/hooks/useUser";
import { useModalStore } from "@/store/modalStore";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

export default function Navbar(props: { handleToggle: () => void, handleSidebarOpen: () => void, sidebarOpen: boolean }) {

  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { data, isLoading } = useUser();

  const itemCount = useCartStore((state) => state.totalQty);

  const { openModal, closeModal } = useModalStore();
  const { t } = useTranslation();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  function handleToggle() {
    setIsOpen(!isOpen);
  }

  const handleLogout = async () => {
    openModal("loading");
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Logout error:', error.message);
      } else {
        console.error('Logout error with unknown error:', error);
      }
    } finally {
      closeModal();
      router.push('/login');
    }
  };

  // Close dropdown on clicking outside dropdown and profile button
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className={`bg-[var(--background)] fixed top-0 left-0 right-0
                    py-3 px-3 border-b-[1px] border-gray-200
                    ${props.sidebarOpen === true ? "z-40" : "z-50"}`}>

      <div className="ml-[0px] sm:ml-[200px] h-14 py-8 px-3 rounded-lg flex items-center justify-between sm:pl-5 bg-white shadow-xs">
        <div className="flex items-center">
          <button
            aria-label="Toggle menu"
            className="text-xl mr-4 px-2 py-1
                      rounded-sm cursor-pointer sm:hidden text-gray-500 hover:text-gray-600"
            onClick={() => props.handleSidebarOpen()}
          >
            <FiMenu />
          </button>
          <div className="flex items-left flex-col">
            <h1 className="sm:text-xl text-base font-bold min-h-[25px] text-blue-700">{isLoading ? "" : data?.fullName}</h1>
            {hasMounted && (
              <p className="sm:text-xs text-[0.7rem] text-gray-500">
                {isLoading ? "" : dayjs(new Date().toLocaleString()).format("ddd, MMMM D, YYYY")}
              </p>
            )}
          </div>
        </div>

        {/* Updated this div: Removed space-x-3 and md:space-x-0 to allow individual margins */}
        <div className="flex items-center md:order-2 relative">

          <div className="mr-5 hidden md:block"> {/* This mr-5 should now work */}
              <LanguageSwitcher />
          </div>

          <div
            onClick={() => props.handleToggle()}
            className="mr-5 border-[1px] border-gray-200 rounded-full p-2 cursor-pointer hover:bg-gray-100 relative" // This mr-5 should now work
          >
            <div className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {itemCount}
            </div>
            <IoCartOutline size={28} />
          </div>

          <button
            ref={profileButtonRef}
            type="button"
            className="flex text-sm 
                       rounded-full focus:ring-[1.5px] focus:ring-blue-600 mr-2
                       cursor-pointer
                       outline-none bg-gray-300 border-[1px] border-gray-200" 
            onClick={handleToggle}
          >
            <span className="sr-only">Open user menu</span>
            {isLoading ? (
              <div className="w-11 h-11 rounded-full bg-gray-400 animate-pulse"></div>
            ) : (
              <Image
                className="rounded-full object-cover w-11 h-11"
                height={48}
                width={48}
                src={data?.userImgUrl || "/man.png"}
                alt="user photo"
                priority
              />

            )}
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="z-50 my-4 text-sm text-gray-900 absolute -right-3 top-11 list-none bg-white divide-y divide-gray-100 rounded-sm shadow-lg "
            >
              <button onClick={() => router.push("/settings/profile")}>
                <div className="px-4 py-3 cursor-pointer text-left hover:bg-blue-200
                               rounded-t-sm transition-all duration-200">
                  <span className="block text-sm text-gray-900">{data?.fullName}</span>
                  <span className="block text-sm text-gray-500 truncate">{data?.username}</span>
                </div>
              </button>

              <ul>
                <li>
                  <button
                    onClick={() => router.push("/settings/billing-invoicing")}
                    className="block px-4 py-2.5 text-sm
                             text-gray-700 hover:bg-blue-200
                               cursor-pointer w-full text-left transition-all duration-200"
                  >
                    Billing and invoicing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="block px-4 py-2.5 text-sm
                             text-gray-700 hover:bg-blue-200
                               cursor-pointer w-full text-left transition-all duration-200"
                  >
                    {t("dashboard")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/settings")}
                    className="block px-4 py-2.5 text-sm
                             text-gray-700 hover:bg-blue-200
                               cursor-pointer w-full text-left transition-all duration-200"
                  >
                    {t("settings")}
                  </button>
                </li>
                <li>
                  <a
                    onClick={handleLogout}
                    className="block px-4 py-2.5 text-sm
                             text-gray-700 hover:bg-blue-200
                               cursor-pointer rounded-b-sm transition-all duration-200"
                  >
                    {t("btnTxt_signOut")}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
