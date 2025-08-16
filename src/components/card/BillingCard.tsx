"use client";

import { SelectedPlan } from "@/app/settings/billing-invoicing/page";
import React from "react";
import { HiCheck } from "react-icons/hi";

interface Features {
  haveAdminPanel: boolean;
  userLimit: string;
  storageLimit: string;
  isCustomizable: boolean;
  support: string;
  versionSupport: string;
}

interface Plan {
  code: string;
  name: string;
  pricePerMonth: string;
  buttonText: "Current Plan" | "Upgrade" | "Downgrade";
  features: Features;
}


interface BillingCardProps {
  plan: Plan;
  setSelectedPlan: React.Dispatch<React.SetStateAction<SelectedPlan>>;
  className?: string
}


export default function BillingCard({ plan, className, setSelectedPlan }: BillingCardProps) {

  const isCurrent = plan.buttonText === "Current Plan";
  const handleSelect = (code: string, action: string) => {
  setSelectedPlan({ code, action }); 
  };

  const borderClass = isCurrent
    ? "border-[1.5px] border-blue-500"
    : "border-[1.5px] border-gray-200";

  const bgClass = isCurrent ? "bg-blue-50/20" : "";

  const buttonClass = {
    "Current Plan": "text-gray-600 hover:bg-gray-50",
    Upgrade: "text-white bg-blue-600 hover:bg-blue-700",
    Downgrade: "text-gray-600 hover:bg-gray-50",
  }[plan.buttonText];

  const currentDisabledButton = () => {
      if(isCurrent) {
        return "pointer-events-none cursor-not-allowed select-none";
      }
  }

  const featureItems: string[] = [
    plan.features.userLimit,
    plan.features.storageLimit,
    plan.features.support,
    plan.features.versionSupport,
    plan.features.haveAdminPanel ? "Admin Panel" : "",
    plan.features.isCustomizable ? "Customizable" : "",
  ];

  return (
    <div
      className={`relative select-none flex flex-col items-left justify-center min-h-[290px]
        sm:min-h-[300px] w-full ${borderClass} ${className}
        rounded-lg p-3 sm:px-6 sm:py-5 text-[0.8rem] sm:text-sm ${bgClass}
        hover:shadow-sm shadow-xs hover:bg-gray-50/20 hover:scale-[99.5%] transition-all duration-300`}
    >
      {
        isCurrent &&
        <HiCheck className="text-white bg-blue-600 h-5 w-5 p-[0.3px] rounded-full absolute top-3 right-3"/> 
      }
      

      <div className="flex flex-col">
        <span className="text-[0.85rem] font-semibold text-gray-500">
          {plan.name}
        </span>
        <span className="text-lg text-gray-700 font-semibold">
          {plan.pricePerMonth}
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-2 min-h-[165px] text-gray-400 ">
        {featureItems.map(
          (text, idx) =>
            text && (
              <li key={idx} className="flex items-center gap-2">
                <HiCheck
                  className="text-blue-600 border-[1.5px] font-bold h-4 w-4 rounded-full border-blue-600 p-[0.3px]"
                />
                {text}
              </li>
            )
        )}
      </ul>

      <button
        onClick={()=> handleSelect(plan.code, plan.buttonText)}
        className={`mt-5 w-full ${buttonClass} py-2 rounded-sm text-sm border-1 border-gray-200 ${currentDisabledButton()}`}
      >
        {plan.buttonText}
      </button>
    </div>
  );
}
