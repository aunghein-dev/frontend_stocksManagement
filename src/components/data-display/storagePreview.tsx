"use client";

import GuageArch from "@/components/data-display/atoms/guage";
import { useTranslation } from "@/hooks/useTranslation";
import useOp from "@/lib/stores/useOp";
import useStorage from "@/lib/stores/useStorage";
import { useEffect, useMemo } from "react";

export default function StoragePreview(props: { number: number; storage: number }) {
  const { storage } = useStorage(); // { limitStorageKb, limitStorageTxt }
  const MAX_STORAGE_KB = storage?.limitStorageKb ?? 0;
  const { t } = useTranslation();

  // props.storage is MB -> convert to KB
  const usedKb = useMemo(() => props.storage * 1024, [props.storage]);

  // percentage derived from usedKb + MAX_STORAGE_KB
  const percentage = useMemo(() => {
    if (!MAX_STORAGE_KB) return 0;
    const p = (usedKb / MAX_STORAGE_KB) * 100;
    return Math.max(0, Math.min(100, p)); // clamp to 0–100
  }, [usedKb, MAX_STORAGE_KB]);

  // Compute message locally for UI (no need to store it)
  const message = useMemo(() => {
    if (!MAX_STORAGE_KB) return "";
    if (percentage <= 50) return t("msg_stg_available") || "Plenty of space";
    if (percentage < 80)  return t("msg_stg_moderate")  || "Moderate space";
    if (percentage < 95)  return t("msg_stg_almostFull")|| "Almost full";
    return t("msg_stg_full") || "Full";
  }, [percentage, MAX_STORAGE_KB, t]);

  const setPercentage = useOp((s) => s.setPercentage);

  useEffect(() => {
    if (!MAX_STORAGE_KB) return;
    setPercentage(percentage); // update whenever percentage changes
  }, [percentage, MAX_STORAGE_KB, setPercentage]);

  return (
    <div className="w-full p-4 flex flex-col md:flex-row items-center justify-center gap-2 mb-4 pt-20 relative">
      <div className="flex justify-center items-center w-40 h-40">
        <GuageArch number={props.number} />
      </div>

      <div className="flex flex-col">
        <div className="w-full max-w-sm p-4 bg-white rounded-sm shadow-sm">
          <div className="flex flex-wrap items-center mb-2">
            <p className="text-[0.7rem] font-semibold text-gray-600 mr-1.5">Storage</p>
            <p className="text-sm font-medium text-gray-800">
              {Math.floor(props.storage)} MB / {storage?.limitStorageTxt ?? "-"}
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-l-full"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">{message}</p>
        </div>
      </div>
    </div>
  );
}
