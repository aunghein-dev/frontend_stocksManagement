"use client";

import Sidebar from "@/components/navigation/sidebar";
import Navbar from "@/components/navigation/navbar";
import CartPopup from "@/components/ui/modals/Cart";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import useOrderNo from "@/lib/stores/useOrderNo";
import { useDiscountStore } from "@/lib/stores/useDiscountStore";
import useCheckoutCustomer from "@/lib/stores/useCheckoutCustomer";
import useOp from "@/lib/stores/useOp";

export default function Container({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const noLayoutRoutes = useMemo(
    () => ["/login", "/signup", "/terms-and-conditions", "/pos"],
    []
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { clearOrderNo } = useOrderNo();
  const { resetDiscount } = useDiscountStore();
  const { clearCheckoutCustomer } = useCheckoutCustomer();

  // If possible, select just the needed field to reduce re-renders:
  // const percentage = useOp((s) => s.percentage);  // <- preferred
  // For now we'll keep your existing shape:
  const { op } = useOp();

  // Derive UI directly from percentage (no state, no effect)
  const isLimited = (op?.percentage ?? 0) >= 99;
  const textBlock = isLimited ? "block" : "hidden";
  const blurIntensity = isLimited ? "blur-sm" : "blur-none"; 

  if (noLayoutRoutes.includes(pathname)) {
    // No hooks appear after this return → rules-of-hooks satisfied
    return <div className="h-screen overflow-auto custom-scrollbar">{children}</div>;
  }

  function handleSidebarOpen() {
    setSidebarOpen((prev) => !prev);
  }

  const handleToggle = () => {
    setIsOpen(false);
    clearOrderNo();
    resetDiscount();
    clearCheckoutCustomer();
  };

  return (
    <div>
      {/* Banner only when >= 99% */}
      <h1
        className={`text-red-500 z-[9999] opacity-100 text-center bg-red-50 py-4 px-10 border-1
                    border-red-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg
                    ${textBlock}`}
      >
        Your cloud storage is full or license has expired.
      </h1>

      {/* Blur intensity derived from percentage */}
      <div className={`flex h-full ${blurIntensity}`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1">
          <Navbar
            handleToggle={() => setIsOpen((prev) => !prev)}
            handleSidebarOpen={handleSidebarOpen}
            sidebarOpen={sidebarOpen}
          />
          <main
            className="flex-1 min-h-0 overflow-auto custom-scrollbar
                       pt-[1.5px] px-3 ml-[0px] sm:ml-[200px] mt-[98px] mb-[10px]"
          >
            {children}
          </main>
        </div>
        {isOpen && <CartPopup handleToggle={handleToggle} />}
      </div>
    </div>
  );
}
