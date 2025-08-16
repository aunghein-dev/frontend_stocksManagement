
import { ScanBarcode } from "lucide-react";

export default function ScanBarcodeButton(
    { handleOpenScanner, t }: 
    { handleOpenScanner: () => void, 
      t(key: string): string 
    }) {
  return (
    <button
      title={t("openManualScanner")} // Use translation for title
      onClick={handleOpenScanner}
      className="bg-gradient-to-br from-blue-600 to-red-400 hover:from-blue-700 hover:to-red-500
      text-white p-2 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-[1.5px] focus:ring-offset-2 focus:ring-blue-600 cursor-pointer"
    >
      <ScanBarcode className="w-5 h-5" />
    </button>
  )
}