"use client";


import React from "react";
import { Button } from "../atoms/Button";
import { ModalHeader } from "../molecules/ModalHeader";


interface PaySlipEntryProps {
  setPaySlipEntryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleChangePlan: (e: React.FormEvent<HTMLFormElement>) => void;
  processing: boolean;
}

export default function PaySlipEntry({
  setPaySlipEntryOpen,
  handleChangePlan,
  processing
}: PaySlipEntryProps) {
  const paySlipRef = React.useRef<HTMLInputElement>(null);
  const [paySlip, setPaySlip] = React.useState<string>("");

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-90">
      <div className="relative flex flex-col gap-0 p-0 bg-white shadow-xl border border-gray-200 rounded-xs max-w-sm w-[90dvw]">
      
          <ModalHeader title="Pay Slip ID" 
                    haveExitButton
                    onClick={() => {
                    setPaySlipEntryOpen(false);
                    setPaySlip("");
                  }}
           />  

        <form onSubmit={handleChangePlan} className="flex flex-col gap-4 p-4">
          <input
            ref={paySlipRef}
            type="text"
            value={paySlip}
            onChange={(e) => setPaySlip(e.target.value)}
            placeholder={"Enter Pay Slip ID"}
            className="w-full py-2.5 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm focus:border-transparent
            transition-all ease-in-out duration-100"
            autoFocus
          />
          <Button
            variant="primary"
            size="sm"
            type="submit"
            className={`${processing || paySlip === "" ? "cursor-not-allowed" : ""}`}
            disabled={processing || paySlip === ""}
          >
            {processing ?
            <div className="flex flex-row items-center gap-3 justify-center text-gray-300">
              <div className="animate-spin rounded-full 
                              h-5 w-5 border-t-2 border-gray-300"></div>
              Processing
            </div> 
            
            : 'Change Plan'}
          </Button>
          
        </form>
      </div>
    </div>
  );
}
