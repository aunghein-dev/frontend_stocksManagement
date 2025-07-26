import {  X as CloseIcon } from "lucide-react";

type BarcdoeManualScannerProps = {
  setOpenManualScanner: React.Dispatch<React.SetStateAction<boolean>>;
  setManualBarcodeInput: React.Dispatch<React.SetStateAction<string>>;
  setBarcodeScanError: React.Dispatch<React.SetStateAction<string | null>>;
  manualBarcodeInput: string;
  manualInputRef: React.RefObject<HTMLInputElement>;
  handleManualBarcodeSubmit: (e: React.FormEvent) => void;
  t(key: string): string
}

export default function BarcodeManualScanner(props: BarcdoeManualScannerProps) {
  return(
     <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-90">
      <div className="relative flex flex-col gap-4 p-6 bg-white shadow-xl border border-gray-200 rounded-xs max-w-sm w-full">
        <h3 className="text-lg font-semibold">{props.t("lbl_manualBarcodeEntry")}</h3>
        <button
          onClick={() => {
            props.setOpenManualScanner(false);
            props.setManualBarcodeInput(""); 
            props.setBarcodeScanError(null); 
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <form onSubmit={props.handleManualBarcodeSubmit} className="flex flex-col gap-3">
          <input
            ref={props.manualInputRef}
            type="text"
            value={props.manualBarcodeInput}
            onChange={(e) => props.setManualBarcodeInput(e.target.value)}
            placeholder={props.t("lbl_enterBarcode")}
            className="w-full py-3 px-4 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            autoFocus // Auto-focus when modal opens
          />
          <button
            type="submit"
            className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xs transition duration-200 cursor-pointer"
          >
            {props.t("btnTxt_addManually")}
          </button>
        </form>
      </div>
    </div>
  )
}