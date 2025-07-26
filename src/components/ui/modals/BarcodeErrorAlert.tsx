import React from 'react'; 

interface BarcodeErrorAlertProps {
  barcodeScanError: string | "";
  setBarcodeScanError: React.Dispatch<React.SetStateAction<string | null>>;
  t: (key: string) => string;
}

const BarcodeErrorAlert = ({ barcodeScanError, setBarcodeScanError, t } : BarcodeErrorAlertProps) => {
  if (!barcodeScanError) {
    return null; // Don't render if no error
  }

  return (
   <div className="fixed bottom-[3%] right-[2.5%] text-red-600 px-4 py-3 flex items-center justify-center bg-opacity-50 z-50 bg-red-100 border-[0.5px] border-red-400 rounded-md" role="alert">
    <div className='flex flex-row items-center justify-between gap-2 w-full'>
        <span className="block sm:inline mr-5">{barcodeScanError}</span>
        <span className="absolute -right-2 top-0 bottom-0 px-4 py-3">
          <svg onClick={() => setBarcodeScanError(null)} className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>{t("close")}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 1 1 1.697 1.697L11.697 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
        </span>
    </div>
    
  </div>
  );
};

export default BarcodeErrorAlert;