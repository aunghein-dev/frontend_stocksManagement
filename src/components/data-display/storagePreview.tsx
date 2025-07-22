import GuageArch from "@/components/data-display/atoms/guage";
import { useTranslation } from "@/hooks/useTranslation";
export default function StoragePreview(props: { number: number, storage: number }) {


const MAX_STORAGE_GB = 1; // 1 GB
const MAX_STORAGE_KB = MAX_STORAGE_GB * 1024 * 1024; // Convert 1 GB to KB
const { t } = useTranslation();

// Function to determine the dynamic message based on percentage
const getStorageMessage = (kbUsed: number) => { // Renamed parameter to kbUsed for clarity

  // Calculate the percentage of storage used
  const percentage = (kbUsed / MAX_STORAGE_KB) * 100;

  if (percentage <= 50) {
    return t("msg_stg_available");
  } else if (percentage > 50 && percentage < 80) { // Changed >= to > to avoid overlap with previous condition
    return t("msg_stg_moderate");
  } else if (percentage >= 80 && percentage < 95) {
    return t("msg_stg_almostFull");
  } else { // percentage >= 95
    return t("msg_stg_full");
  }
};


  return (
    <div className="w-full p-4 flex flex-col md:flex-row items-center justify-center gap-2 mb-4  pt-20 relative">
          {/* Gauge Chart */}
          <div className="flex justify-center items-center w-40 h-40"><GuageArch number={props.number} /></div>

            {/* Text Details */}
          <div className="flex flex-col">
            <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow-sm">
              <div className="flex flex-wrap items-center mb-2">
                <p className="text-[0.7rem] font-semibold text-gray-600 mr-1.5">Storage</p>
                <p className="text-sm font-medium text-gray-800">{Math.floor(props.storage)} MB / {MAX_STORAGE_GB} GB</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {getStorageMessage((props.storage / MAX_STORAGE_GB) * 100)}
              </p>
            </div>
          </div>
           
    </div>
  )
}