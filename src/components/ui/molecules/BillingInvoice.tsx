import { BsFiletypePdf } from "react-icons/bs";
import { FiDownloadCloud } from "react-icons/fi";
export default function BillingInvoice() {
  return (
    <>
      <div className="min-h-[70px] 
                      flex flex-row items-center justify-between
                      border-b-[0.5px] border-gray-200
                      text-gray-600 gap-1">
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          <BsFiletypePdf className="text-gray-500/50 md:h-7 md:w-7 h-6 w-6"/>
           <span className="text-sm md:text-[0.93rem] font-semibold">Invoice 0012</span>
        </div>

        <div className="flex flex-row text-gray-500 
                        text-[0.85rem] md:text-sm gap-2 md:gap-5 lg:gap-10 items-center select-none">
          <span className="mr-3 hidden md:block">12 Apr 2025</span>
          <span className="mr-3">Basic Plan</span>
          <span className="mr-3">MMK 6,000</span>
          <FiDownloadCloud 
                className="md:h-4.5 md:w-4.5 h-4 w-4 text-gray-500/70
                           hover:text-blue-500 transition-all duration-300 cursor-pointer hover:scale-103"
            />

        </div>
        
      </div>
    </>
  );
}