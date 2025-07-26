"use client";

import Sidebar from "@/components/navigation/sidebar";
import Navbar from "@/components/navigation/navbar";
import CartPopup from "@/components/ui/modals/Cart";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import useOrderNo from "@/lib/stores/useOrderNo";
import { useDiscountStore } from "@/lib/stores/useDiscountStore";
import useCheckoutCustomer from "@/lib/stores/useCheckoutCustomer";

export default function Container({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const noLayoutRoutes = useMemo(() => ["/login", "/signup", "/terms-and-conditions"], []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clearOrderNo } = useOrderNo();
  const { resetDiscount} = useDiscountStore();
  const { clearCheckoutCustomer } = useCheckoutCustomer();
  
  if (noLayoutRoutes.includes(pathname)) {
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
    <div className="flex h-full">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1">
        <Navbar handleToggle={() => setIsOpen((prev) => !prev)} handleSidebarOpen={handleSidebarOpen} sidebarOpen={sidebarOpen}/>
        <main className="flex-1 min-h-0 overflow-auto custom-scrollbar
                         pt-[1.5px] px-3 ml-[0px] sm:ml-[200px] mt-[98px] mb-[10px]">
          {children}
        </main>
      </div>
      {isOpen && <CartPopup handleToggle={handleToggle} />}
    </div>
  );
}
